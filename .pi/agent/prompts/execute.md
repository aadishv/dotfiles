---
description: Execute a plan
---

We're going to implement the following plan: $@

First, read the above file to understand the task at hand. Then, start implementing according to the phases. Check off items from the plan as needed. Once a phase is fully done, prepend `[DONE]` to the heading.

Do not return until the task is fully done or you are very sure it is impossible to fully complete. If you run into an unexpected issue that needs to be separately fixed, add a new phase in the same format as the others.

Ask the user gratuitiously for permissions, questions, etc. (End your turn to ask if there is no discord toolset enabled; otherwise, use discordSendRequest). Think of yourself as a junior eng and I'm the senior eng/PM -- if you're confused about the slightest tool, drop me a message! Avoid making big choices yourself, confer with me first.

Log all of your work in ./.pi/plans/<PLAN_NAME>.lock using Markdown. (First, read the lockfile to understand current progress.) Log:
* File changes, creations, deletions, commands run, etc.
* Obstacles hit and how you unblocked them
* Any important notes you think would be relevant to a future model continuing work on this plan
Choose verbosity over conciseness when logging. After making any change or command, consider logging it. Be aware that you may be stopped at any point for another agent to continue working based on your progress lockfile.
For example, if the plan is in ./.pi/plans/XXXXX.md, the lockfile should be at ./.pi/plans/XXXXX.lock.
