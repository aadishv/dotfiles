---
description: Create a plan
---

We are going to implement a plan for a feature. Here's how to do it:

1. Understand everything you need about the feature. Research the codebase, use the `ask-repo` CLI to learn about needed libraries, etc.
2. Put your plan in `./.pi/plans/MMDDYY-SHORT-DESCRIPTION.md`, such as `.pi/plans/012426-ADD-GEMINI-PROVIDER.md` 
3. Format the plan in a concise manner that enables other coding agents to very efficiently read it:
	* The plan should be separated into phases. Each phase should have: a Markdown checklist of files to be changed, (optionally) the types/interfaces/signatures of crucial changes, a checklist to check that the phase has been successfully completed, and a short description of the goal of the phase and how it relates to other phases
	* The checklist for completion can include subjective things "file X is ready to be integrated with file Y" or "the implementation uses idiomatic Python" or also objective things such as "typecheck passes" "file Z uses this library"
	* Feel free to add a subsection with "Notes" and considerations, such as "make sure to research the api surface of library N" or "consider how to wire this up in the frontend before implementation"
4. Prefer checklists over bullet points. The goal is for this plan to function as a "living todo list" that can be constantly updated to track progress.

Don't start implementing yet; that will be the job of another agent. Remember, the implementation agent will not have access to any of the work you did, so any and all important information must be encoded in the plan file.

Here's the feature: $@
