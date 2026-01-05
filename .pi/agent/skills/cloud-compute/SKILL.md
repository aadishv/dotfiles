---
name: cloud-compute
description: Run arbitrary commands on a safely sandboxed, inexpensive cloud machine. Use with the `cloud-research-agent` skill, or to test arbitrary unsafe commands. 
---

This skill provides a minimal script `ghsh` (GitHub SHell) which runs via Bash. It creates a new GitHub Codespace or creates a new one and sets it up for use. You'll find `ghsh` in the same folder as this SKILL.md path. Run it via `/path/to/ghsh <command>`. Codespaces have the `pi` coding agent installed, which is useful for your cloud-research-agent skill. **If you want to run an AI agent in the codespace, use the `cloud-research-agent` skill.**

Minimal example:
```
❯ /path/to/ghsh 'curl example.com -o output.html'
Found existing codespace: pi-cloud-wr95xj55jj7x25jqv
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   513    0   513    0     0  14697      0 --:--:-- --:--:-- --:--:-- 15088
 
❯ /path/to/ghsh 'wc output.html'           
Found existing codespace: pi-cloud-wr95xj55jj7x25jqv
  1  25 513 output.html
```

Make sure to wrap your commands in a string to avoid escaping issues.

Be aware that it may take up to 10 seconds for the SSH command to be established, added to the runtime of the actual command you run. 