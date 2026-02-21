---
name: add-script
description: Instructions for how to make a script that is reusable across the system.
---

If the user asks you to add script:
1. First, identify whether the script is best written as TypeScript or Bash. Other languages such as Python are also possible but avoid them if possible.
2. Write the script into a file in `~/scripts`. The script should not have an extension (.sh, .ts) and instead should use shebangs -- `#!/usr/bin/env bun` or `#!/bin/bash` when possible.
3. If your TypeScript script needs a dependency, use `require` statements to import it using its npm package name. Bun will automatically detect and temporarily installed needed dependencies.
