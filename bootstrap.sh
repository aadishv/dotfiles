#!/bin/bash
set -e

# update and install dependencies
sudo apt-get update
sudo apt-get install -y zsh tmux curl git ripgrep fd-find

# install bun
if ! command -v bun &> /dev/null; then
  curl -fsSL https://bun.sh/install | bash
fi

# install uv
if ! command -v uv &> /dev/null; then
  curl -lsSf https://astral.sh/uv/install.sh | sh
fi

# set zsh as default shell
sudo chsh -s $(which zsh) $(whoami)

# setup dotfiles repo if not already there
if [ ! -d "$HOME/.cfg" ]; then
  git clone --bare https://github.com/aadishv/dotfiles.git "$HOME/.cfg"
fi

config="/usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME"
$config checkout -f main
$config config --local status.showUntrackedFiles no

# codespace specific tmux edits
# change leader to C-a
# change accent color (colour117) to red (colour160 or similar)
sed -i 's/setw -g window-status-current-format .*/setw -g window-status-current-format "#[fg=colour235,bg=colour160,bold] #I #[fg=colour160,bg=colour239] #W "/' "$HOME/.tmux.conf"
if ! grep -q "set-option -g prefix C-a" "$HOME/.tmux.conf"; then
  echo -e "\n# codespace leader change\nunbind C-b\nset-option -g prefix C-a\nbind-key C-a send-prefix" >> "$HOME/.tmux.conf"
fi

# ensure pi directories exist
mkdir -p "$HOME/.pi/agent"

echo "bootstrap complete. restart your shell."
