---
name: research-repo
description: Use an AI agent with full access to a certain external repository to research. Useful when writing code involving a library to get code examples and information. Use when the user suggests to research how to do something with a certain library.
---

# Research repo

Use this guide for cloning and using AI to analyze the repository of a certain repository.

**Example usecase:** you're building an app using the Vercel AI SDK, but you're not sure how to create a custom provider. In this case, you can use this skill to clone the `vercel/ai` GitHub repo and ask an AI for examples of custom providers.

This is especially helpful when you need to know the gnarly aspects of a library without clogging up your own context window.

## Steps

1. Clone the repo into `/tmp` if it doesn't exist already.

In this case, you'd want to run `cd /tmp && git clone git@github.com:vercel/ai.git` which will automatically error if it already exists. Update the SSH path to clone a different repo.

If you run into an authentication error, ask the user to clone it for you. After they have done so, continue with the rest of the steps.

2. Ask a question.

You can use the Pi coding agent for this. Use Grok Code Fast 1 through GitHub Copilot. You'll also want to use the `-p` flag to run Pi in non-interactive mode and output raw Markdown. Restrict it to read-only tools. Here is a full example:

```bash
cd /tmp/ai && pi --provider grok-code-fast-1 --model grok-code-fast-1 --tools read,grep,find,ls -p "code examples for creating a custom provider"
```

This will run the coding agent, using Grok Code Fast 1, in the repository, using read-only tools (to ensure it does not run amok and run a misguided bash command), and return a Markdown response in stdout. 

3. Ask followup questions.

Use the `--continue` flag with Pi, which will resume the session history of the most recently active session in the given directory.

```bash
cd /tmp/ai && pi --continue --provider grok-code-fast-1 --model grok-code-fast-1 --tools read,grep,find,ls -p "how does the google provider implement thought signatures (opaque reasoning)"
```

This likely won't be needed in most cases.

Now, you can use the insights gleamed from this process to continue working on your main task.

**Don't:**
1. Give Pi access to tools that can edit or write files, or run bash commands.
2. Use a model other than grok-code-fast-1. It is an extremely economical model designed for fast code search. Do not change the model or provider.
