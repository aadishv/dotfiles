#!/usr/bin/env bash
# fix_mp3_duration.sh
# Remux MP3s in-place to correct duration metadata (e.g., missing/incorrect VBR headers)
# Uses ffmpeg stream copy (no re-encode) and forces writing a Xing header.

set -Eeuo pipefail
IFS=$'\n\t'

# -------------------------------
# Config / Defaults
# -------------------------------
DRY_RUN=0
QUIET=0
BACKUP_EXT=""
EXIT_CODE=0

# -------------------------------
# Helpers
# -------------------------------
log() {
  if [[ "$QUIET" -eq 0 ]]; then
    printf "%s\n" "$*" >&2
  fi
}

err() {
  printf "ERROR: %s\n" "$*" >&2
}

usage() {
  cat >&2 <<EOF
Usage: $(basename "$0") [options] [FILES_OR_DIRS...]

Repairs MP3 duration metadata by remuxing with ffmpeg (codec copy) and replacing files in-place.

Options:
  -b EXT    Keep a backup copy of each file with extension EXT (e.g. ".bak")
  -n        Dry run; show what would be done without modifying files
  -q        Quiet mode; minimal output
  -h        Show this help

Examples:
  $(basename "$0")                          # Process MP3s under the script's directory
  $(basename "$0") /path/to/music           # Recursively process this directory
  $(basename "$0") -b .bak *.mp3            # Process given files, keep backups with .bak
  $(basename "$0") -n "Album/Track 01.mp3"  # Dry-run on a single file
EOF
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Gather mp3 files from CLI args (dirs recurse). If no args -> script's directory.
gather_files() {
  if [[ "$#" -eq 0 ]]; then
    local script_dir
    script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
    find "$script_dir" -type f \( -iname '*.mp3' \) -print0
    return
  fi

  for p in "$@"; do
    if [[ -d "$p" ]]; then
      find "$p" -type f \( -iname '*.mp3' \) -print0
    elif [[ -f "$p" ]]; then
      case "${p,,}" in
        *.mp3) printf "%s\0" "$p" ;;
        *) err "Skipping non-mp3 file: $p" ;;
      esac
    else
      err "Path not found: $p"
      EXIT_CODE=2
    fi
  done
}

# Safely create a temp output path in the same directory with .mp3 extension
make_tmp_out() {
  local src="$1"
  local d b tmp
  d="$(dirname -- "$src")"
  b="$(basename -- "$src")"
  # Hidden temp file in same dir, ending with .mp3 so ffmpeg picks the mp3 muxer reliably
  tmp="${d}/.${b}.fix.$$.$RANDOM.mp3"
  printf "%s" "$tmp"
}

process_one() {
  local src="$1"
  # Check readable
  if [[ ! -r "$src" ]]; then
    err "Not readable: $src"
    EXIT_CODE=2
    return
  fi

  local tmp out rc
  tmp="$(make_tmp_out "$src")"
  out="$src"

  if [[ "$DRY_RUN" -eq 1 ]]; then
    local backup_note=""
    [[ -n "$BACKUP_EXT" ]] && backup_note=" (backup: ${src}${BACKUP_EXT})"
    log "[DRY] Remux: $src -> $out$backup_note"
    return
  fi

  # Ensure tmp is cleaned on failure
  cleanup() {
    [[ -f "$tmp" ]] && rm -f -- "$tmp" || true
  }
  trap cleanup RETURN

  # Remux with:
  # - stream copy (-c copy) to avoid re-encoding
  # - write a Xing header (-write_xing 1) so duration can be accurately derived
  # - preserve metadata (-map_metadata 0), map everything (-map 0) including album art
  # - id3v2.3 for maximum compatibility
  # - explicit mp3 container (tmp ends with .mp3)
  if [[ "$QUIET" -eq 1 ]]; then
    ffmpeg -hide_banner -loglevel error -nostdin -y \
      -i "$src" \
      -map 0 -map_metadata 0 -c copy -id3v2_version 3 -write_xing 1 \
      "$tmp" || rc=$? || true
  else
    log "Remuxing: $src"
    ffmpeg -hide_banner -loglevel warning -nostdin -y \
      -i "$src" \
      -map 0 -map_metadata 0 -c copy -id3v2_version 3 -write_xing 1 \
      "$tmp" || rc=$? || true
  fi

  rc="${rc:-0}"
  if [[ "$rc" -ne 0 ]]; then
    err "ffmpeg failed on: $src (exit $rc)"
    EXIT_CODE=3
    return
  fi

  if [[ ! -s "$tmp" ]]; then
    err "ffmpeg produced empty file for: $src"
    EXIT_CODE=3
    return
  fi

  # Optionally back up original
  if [[ -n "$BACKUP_EXT" ]]; then
    cp -p -- "$src" "${src}${BACKUP_EXT}" || {
      err "Failed to create backup for: $src"
      EXIT_CODE=4
      return
    }
  fi

  # Atomic-ish replace
  mv -f -- "$tmp" "$out" || {
    err "Failed to replace: $src"
    EXIT_CODE=4
    return
  }

  # Success for this file
  trap - RETURN
  log "Fixed: $src"
}

# -------------------------------
# Parse args
# -------------------------------
while getopts ":b:nqh" opt; do
  case "$opt" in
    b) BACKUP_EXT="$OPTARG" ;;
    n) DRY_RUN=1 ;;
    q) QUIET=1 ;;
    h) usage; exit 0 ;;
    \?) err "Unknown option: -$OPTARG"; usage; exit 2 ;;
    :) err "Option -$OPTARG requires an argument"; usage; exit 2 ;;
  esac
done
shift $((OPTIND - 1))

# -------------------------------
# Preflight checks
# -------------------------------
if ! command_exists ffmpeg; then
  err "ffmpeg not found in PATH. Please install ffmpeg and try again."
  exit 127
fi

# NOTE: ffprobe is not required for this approach; we rely on ffmpeg remux only.

# -------------------------------
# Main
# -------------------------------
# Gather files (null-delimited) and process
# shellcheck disable=SC2046
while IFS= read -r -d '' mp3; do
  process_one "$mp3"
done < <(gather_files "$@")

exit "$EXIT_CODE"