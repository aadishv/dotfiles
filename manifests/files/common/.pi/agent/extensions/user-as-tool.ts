import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.on("context", async (event, ctx) => {
    const messages = [...event.messages];
    if (messages.length < 2) return;

    const lastIndex = messages.length - 1;
    const lastMessage = messages[lastIndex];
    const prevMessage = messages[lastIndex - 1];

    // Only transform if last is user/custom and previous is assistant
    if ((lastMessage.role === "user" || lastMessage.role === "custom") && prevMessage.role === "assistant") {
      const toolCallId = `user-prompt-private_${Date.now()}`;
      const toolName = "user-prompt-private";

      const userContent = typeof lastMessage.content === "string"
        ? lastMessage.content
        : lastMessage.content.map(c => c.type === "text" ? c.text : "").join("\n");

      // 1. Create a new assistant message with the tool call (don't modify the previous one)
      const newAssistantMessage = {
        role: "assistant",
        content: [
          {
            type: "toolCall",
            id: toolCallId,
            name: toolName,
            arguments: { input: userContent }
          }
        ],
        api: prevMessage.api,
        provider: prevMessage.provider,
        model: prevMessage.model,
        usage: {
          input: 0,
          output: 0,
          cacheRead: 0,
          cacheWrite: 0,
          totalTokens: 0,
          cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
        },
        stopReason: "toolUse",
        timestamp: Date.now(),
      } as any;

      // 2. Convert user message to tool result
      const toolResultMessage = {
        role: "toolResult",
        toolCallId: toolCallId,
        toolName: toolName,
        content: [{ type: "text", text: userContent }],
        isError: false,
        timestamp: Date.now(),
      } as any;

      // Replace the last message with the new assistant message, then add tool result
      messages[lastIndex] = newAssistantMessage;
      messages.push(toolResultMessage);

      return { messages };
    }
  });
}
