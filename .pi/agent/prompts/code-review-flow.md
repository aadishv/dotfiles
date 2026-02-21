---
description: Generate a list of files to review
---

I am going to code review the changes locally from $@. Look at the diff between the local changes and that branch/commit and generate an order of files for me to review. This order should include all changed files that involve important code (e.g., lockfiles and images can be excluded) and should be "topologically" sorted. If File A's diff only makes sense in the context of File B's changes, File A should be after File B in the order. After producing the final order, output it as a numbered list of paths.
