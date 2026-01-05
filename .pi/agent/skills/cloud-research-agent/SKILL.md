---
name: cloud-research-agent
description: Use an AI agent in a cloud sandbox with full access to an external Github repository to research. Useful when writing code involving a library to get code examples and information. Use when you need to better understand how the API, SDK, architecture, philosophy, etc. works of a certain library/repo.
---

Use this guide for cloning and using AI to analyze the repository of a certain library.

**Example usecase:** you're building an app using the Vercel AI SDK, but you're not sure how to create a custom provider. In this case, you can use this skill to clone the `vercel/ai` GitHub repo and ask an AI for examples of custom providers.

This is especially helpful when you need to know the gnarly aspects of a library without clogging up your own context window or running dangerous commands on your host machine.

This will entail you using the `cloud-compute` skill, which provides a `ghsh` tool to run arbitrary commands in an automatically provisioned GitHub Codespace. Read that skill after this for further information.

## Steps

1. Clone the repo if it doesn't exist already.

Example:
```
❯ /path/to/ghsh 'gh repo clone vercel/ai'
Found existing codespace: pi-cloud-wr95xj55jj7x25jqv
Cloning into 'ai'...
```
This will automatically error if it already exists. Update the path to clone a different repo.

2. Ask a question.

You can use the Pi coding agent for this, which is preinstalled in the codespace. Use Grok Code Fast 1 through GitHub Copilot. You'll also want to use the `-p` flag to run Pi in non-interactive mode and output raw Markdown.

Example:
````
❯ /path/to/ghsh 'cd ai && pi --provider github-copilot --model grok-code-fast-1 -p "simple code example for using the openai provider with the AI SDK, research the repo you are in"'
Found existing codespace: pi-cloud-wr95xj55jj7x25jqv
```ts
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const { text } = await generateText({
  model: openai('gpt-4o'),
  prompt: 'What is an agent?',
});

// ...
```

This example demonstrates...
````

This will run the coding agent, using Grok Code Fast 1, in the repository, returning a Markdown response in stdout. 

3. Ask followup questions.

Use the `--continue` flag with Pi, which will resume the session history of the most recently active session in the given directory.

```bash
❯ path/to/ghsh 'cd ai && pi --continue --provider github-copilot --model grok-code-fast-1 -p "how does the google provider implement thought signatures (opaque reasoning)"'
Found existing codespace: pi-cloud-wr95xj55jj7x25jqv
The Google provider implements thought signatures by modifying the chunk schema and relevant transformer functions: ...
```

This likely won't be needed in most cases.

Now, you can use the insights gleamed from this process to continue working on your main task.

## Important note

**Don't use a model other than grok-code-fast-1, or provider other than github-copilot.** Grok Code on GitHub Copilot is an extremely economical model designed for fast code search.