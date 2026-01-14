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
