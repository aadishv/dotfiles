/**
 * Custom Compaction Extension using GLM-4.7 via OpenRouter
 *
 * Uses glm-4.7 for conversation summarization instead of the current conversation model.
 * This can be cheaper/faster than using the main conversation model for compaction.
 *
 * Usage:
 *   Add to settings.json: { "extensions": ["/Users/aadishverma/.pi/agent/extensions/glm-4.7-compaction.ts"] }
 *   Or run: pi --extension ~/.pi/agent/extensions/glm-4.7-compaction.ts
 *
 * Requirements:
 *   - OPENROUTER_API_KEY environment variable or auth.json entry for "openrouter"
 */

import { complete, getModel } from "@mariozechner/pi-ai";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { convertToLlm, serializeConversation } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	pi.on("session_before_compact", async (event, ctx) => {
		const { preparation, signal } = event;
		const { messagesToSummarize, turnPrefixMessages, tokensBefore, firstKeptEntryId, previousSummary, settings } = preparation;

		// Use GLM-4.7 via OpenRouter for summarization
		const model = getModel("openrouter", "z-ai/glm-4.7");
		if (!model) {
			ctx.ui.notify(`Could not find z-ai/glm-4.7 model, using default compaction`, "warning");
			return;
		}

		// Resolve API key for the summarization model
		const apiKey = await ctx.modelRegistry.getApiKey(model);
		if (!apiKey) {
			ctx.ui.notify(`No API key for ${model.provider}, using default compaction`, "warning");
			return;
		}

		// Combine all messages for summary (same as default compaction logic)
		const allMessages = [...messagesToSummarize, ...turnPrefixMessages];

		if (allMessages.length === 0) {
			return;
		}

		ctx.ui.notify(
			`Compacting with GLM-4.7: ${allMessages.length} messages (${tokensBefore.toLocaleString()} tokens)...`,
			"info",
		);

		// Convert messages to readable text format (same as default compaction)
		const conversationText = serializeConversation(convertToLlm(allMessages));

		// Include previous summary context if available
		const previousContext = previousSummary ? `\n\nPrevious session summary:\n${previousSummary}` : "";

		// Build summarization messages (same prompt format as default compaction)
		const summaryMessages = [
			{
				role: "user" as const,
				content: [
					{
						type: "text" as const,
						text: `The messages above are a conversation to summarize. Create a structured context checkpoint summary that another LLM will use to continue the work.${previousContext}

Use this EXACT format:

## Goal
[What is the user trying to accomplish? Can be multiple items if the session covers different tasks.]

## Constraints & Preferences
- [Any constraints, preferences, or requirements mentioned by user]
- [Or "(none)" if none were mentioned]

## Progress
### Done
- [x] [Completed tasks/changes]

### In Progress
- [ ] [Current work]

### Blocked
- [Issues preventing progress, if any]

## Key Decisions
- **[Decision]**: [Brief rationale]

## Next Steps
1. [Ordered list of what should happen next]

## Critical Context
- [Any data, examples, or references needed to continue]
- [Or "(none)" if not applicable]

Keep each section concise. Preserve exact file paths, function names, and error messages.

<conversation>
${conversationText}
</conversation>`,
					},
				],
				timestamp: Date.now(),
			},
		];

		try {
			// Calculate max tokens based on reserveTokens setting (same as default compaction)
			const maxTokens = Math.floor(0.8 * settings.reserveTokens);

			// Pass signal to honor abort requests
			const response = await complete(model, { messages: summaryMessages }, { apiKey, maxTokens, signal });

			if (response.stopReason === "error") {
				ctx.ui.notify(`GLM-4.7 compaction failed: ${response.errorMessage || "Unknown error"}`, "error");
				return;
			}

			const summary = response.content
				.filter((c): c is { type: "text"; text: string } => c.type === "text")
				.map((c) => c.text)
				.join("\n");

			if (!summary.trim()) {
				if (!signal.aborted) ctx.ui.notify("Compaction summary was empty, using default compaction", "warning");
				return;
			}

			// Return compaction content - SessionManager adds id/parentId
			return {
				compaction: {
					summary,
					firstKeptEntryId,
					tokensBefore,
				},
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			ctx.ui.notify(`Compaction failed: ${message}`, "error");
			// Fall back to default compaction on error
			return;
		}
	});
}