---
name: taildrop-receive
description: Receive and manage files from the Taildrop queue on a Tailscale network. Use to download pending files to a specified directory.
---

# Taildrop Receive

This skill helps you receive files sent via Taildrop, Tailscale's file sharing feature.

## Prerequisites

- Tailscale must be installed and logged in.
- Ensure your device is connected to the Tailscale network.

## Usage

To receive files from the Taildrop queue:

```bash
tailscale file get --wait=false --verbose <target-directory>
```

Options:
- `--wait=false`: Exit immediately if no files are pending (default).
- `--wait=true`: Wait for files to arrive.
- `--conflict=rename`: Rename files if they conflict with existing ones.
- `--conflict=overwrite`: Overwrite existing files.
- `--verbose`: Show detailed output.

Example: Receive files to ~/Downloads without waiting:
```bash
tailscale file get --wait=false --verbose ~/Downloads
```



## Checking Queue Status

To check if files are pending without downloading:
- Run `tailscale file get --wait=false --verbose /tmp/check` and check if any files are moved.
- If "moved 0/0 files", the queue is empty.