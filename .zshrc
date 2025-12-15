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
