#!/bin/bash

# Script to download a single YouTube/YT Music video as MP3 audio
# Usage: ./download_audio.sh "<video_url>"

if [ $# -eq 0 ]; then
    echo "Error: No URL provided. Usage: $0 \"<video_url>\""
    exit 1
fi

URL="$1"

yt-dlp -f "ba/b" -x --audio-format mp3 --audio-quality 0 --no-embed-thumbnail -o "%(title)s.%(ext)s" "$URL"
