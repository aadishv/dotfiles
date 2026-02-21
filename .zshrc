# shell setup
autoload -Uz compinit
compinit

# environment variables
export EDITOR="nvim"
export OPENCODE_EXPERIMENTAL=1

# path configuration
export PATH="$HOME/.cargo/bin:$HOME/.local/bin:$HOME/.bun/bin:$PATH"
export PATH="/Applications/ArmGNUToolchain/14.2.rel1/arm-none-eabi/bin:$PATH"
export PATH="$HOME/.amp/bin:$PATH"
export PATH="$HOME/scripts:$PATH"

# app configs
export GHOSTTY_CONFIG="$HOME/Library/Application Support/com.mitchellh.ghostty/config"
export ZED_CONFIG="$HOME/.config/zed/settings.json"
export PI_CONFIG="$HOME/.pi/agent"
export __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS='aadish'

# aliases
alias config='/usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME'
alias activate='source .venv/bin/activate'
alias pdfjoin='/System/Library/Automator/Combine PDF Pages.action/Contents/MacOS/join'
alias html-share="bun --env-file /Users/aadishverma/Desktop/codeproj/active/aadishv.dev/.env.local /Users/aadishverma/Desktop/codeproj/active/aadishv.dev/src/pages/s/_add.ts"
alias generic-share="bun --env-file /Users/aadishverma/Desktop/codeproj/active/aadishv.dev/.env.local /Users/aadishverma/Desktop/codeproj/active/aadishv.dev/src/pages/s/_add_generic.ts"
alias typst-preview="tinymist preview --data-plane-host $(tailscale ip -4):8080 --no-open --root ~/"
# tools & completions
eval "$(zoxide init zsh)"
eval "$(terminal-wakatime init)"
eval "$(starship init zsh)"

# bun completions
[ -s "/Users/aadishverma/.bun/_bun" ] && source "/Users/aadishverma/.bun/_bun"

# secrets
[[ -f ~/.secrets.sh ]] && source ~/.secrets.sh

# ssh 
if [[ -n "$SSH_CLIENT" || -n "$SSH_CONNECTION" ]]; then
  if command -v tmux &>/dev/null && [[ -z "$TMUX" ]]; then
    tmux -u attach -t 0 || tmux -u new-session -s 0
  fi
fi

__pi_osc52_copy() {
  emulate -L zsh
  setopt localoptions pipefail

  local data b64 osc
  data="$(cat)"
  b64="$(printf %s "$data" | base64 | tr -d '\r\n')"

  if (( ${#b64} > 100000 )); then
    print -u2 "pbcopy (OSC52): payload too large (${#b64} chars); falling back to system pbcopy"
    command pbcopy 2>/dev/null || return 1
    return 0
  fi

  osc=$'\033]52;c;'"${b64}"$'\a'

  if [[ -n "${TMUX-}" ]]; then
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

if [[ -z "${SSH_AUTH_SOCK:-}" && "$OSTYPE" == darwin* ]]; then
  for sock in /private/tmp/com.apple.launchd.*/Listeners(N); do
    if SSH_AUTH_SOCK="$sock" ssh-add -l >/dev/null 2>&1; then
      export SSH_AUTH_SOCK="$sock"
      break
    fi
  done
fi

# keybind alt+x to work as expected (thanks clawd!)
bindkey '^[[1;3C' forward-word          # Alt+Right
bindkey '^[[1;3D' backward-word         # Alt+Left
bindkey '^[[1;3A' beginning-of-line     # Alt+Up (bonus)
bindkey '^[[1;3B' end-of-line           # Alt+Down (bonus)
bindkey '^[^?' backward-kill-word       # Alt+Backspace
bindkey '^[[3;3~' kill-word             # Alt+Delete (bonus)

