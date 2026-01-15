# weird setup stuff
autoload -Uz compinit
compinit

# tool init
eval "$(zoxide init zsh)"
export PATH="$HOME/.bun/bin:$PATH"

# zsh alias thingy
alias -s ts='bun'
alias -s py='uv run'
alias -s sh='bash'

# setup arm-none-eabi-gcc
export PATH=$PATH:/Applications/ArmGNUToolchain/14.2.rel1/arm-none-eabi/bin

# config files
export GHOSTTY_CONFIG=$HOME/Library/Application\ Support/com.mitchellh.ghostty/config
export OPENCODE_CONFIG=$HOME/.config/opencode/opencode.json
export ZED_CONFIG=$HOME/.config/zed/settings.json
alias config='git --git-dir=$HOME/.cfg/ --work-tree=$HOME'

# venv
alias activate='source .venv/bin/activate'
alias pdfjoin='/System/Library/Automator/Combine PDF Pages.action/Contents/MacOS/join' # example: pdfjoin -o out.pdf in1.pdf in2.pdf

# terminal-wakatime setup
eval "$(terminal-wakatime init)"

# use web search in opencode
export OPENCODE_ENABLE_EXA=1

# prompt (Starship)
eval "$(starship init zsh)"

# bun completions
[ -s "/Users/aadishverma/.bun/_bun" ] && source "/Users/aadishverma/.bun/_bun"

# playtime
alias pigy="/Users/aadishverma/Desktop/codeproj/gh/ccs/dist/ccs.js"

# for blog
alias html-share="bun --env-file /Users/aadishverma/Desktop/codeproj/active/aadishv.dev/.env.local /Users/aadishverma/Desktop/codeproj/active/aadishv.dev/src/pages/s/_add.ts"

# set up prompt editing in pi
EDITOR=zed

# Amp CLI
export PATH="/Users/aadishverma/.amp/bin:$PATH"

# add scripts
export PATH="/Users/aadishverma/scripts:$PATH"

# Ensure SSH agent is reachable in shells where SSH_AUTH_SOCK is missing (noninteractive, some IDEs)
if [[ -z "${SSH_AUTH_SOCK:-}" && "$OSTYPE" == darwin* ]]; then
  for sock in /private/tmp/com.apple.launchd.*/Listeners(N); do
    if SSH_AUTH_SOCK="$sock" ssh-add -l >/dev/null 2>&1; then
      export SSH_AUTH_SOCK="$sock"
      break
    fi
  done
fi

# pbcopy -> local clipboard when connected over SSH (OSC 52)
__pi_osc52_copy() {
  emulate -L zsh
  setopt localoptions pipefail

  local data b64 osc

  data="$(cat)"
  b64="$(printf %s "$data" | base64 | tr -d '\r\n')"

  # Refuse extremely large payloads (many terminals/tmux have OSC52 limits)
  if (( ${#b64} > 100000 )); then
    print -u2 "pbcopy (OSC52): payload too large (${#b64} chars); falling back to system pbcopy"
    command pbcopy 2>/dev/null || return 1
    return 0
  fi

  osc=$'\033]52;c;'"${b64}"$'\a'

  if [[ -n "${TMUX-}" ]]; then
    # tmux passthrough
    printf '\033Ptmux;\033%s\033\\' "$osc"
  elif [[ "${TERM-}" == screen* ]]; then
    printf '\033P%s\033\\' "$osc"
  else
    printf '%s' "$osc"
  fi
}

pbcopy() {
  if [[ -n "${SSH_CONNECTION-}${SSH_TTY-}" ]]; then
    __pi_osc52_copy
  else
    command pbcopy "$@"
  fi
}

export EDITOR=vim
