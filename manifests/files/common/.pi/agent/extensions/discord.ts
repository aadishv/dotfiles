import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import { config } from "dotenv";
import { resolve, isAbsolute, relative } from "path";
import type { ExtensionAPI, ExtensionContext } from "../../../.bun/install/global/node_modules/@mariozechner/pi-coding-agent/dist/index.js";

const envPath = resolve(process.env.HOME || "", ".pi/discord/.env");
config({ path: envPath, quiet: true });

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const USER_ID = process.env.USER_ID;

const discordExtension = (pi: ExtensionAPI) => {
  pi.registerFlag("discord", { description: "Enable Discord bot integration", type: "boolean", default: false });

  let client: Client | null = null;
  const pendingReplies = new Map<string, (content: string) => void>();
  let lastFinalOutputMessageId: string | null = null;

  const formatArgs = (name: string, args: any, cwd: string) => {
    if (!args) return "";
    let parsedArgs = args;
    if (typeof args === "string") {
      try {
        parsedArgs = JSON.parse(args);
      } catch {
        return `\`${args}\``;
      }
    }

    let p = parsedArgs.path || parsedArgs.file_path || "";
    if (p && isAbsolute(p)) {
      p = relative(cwd, p) || ".";
    }

    if (name === "bash") return `\`${parsedArgs.command || ""}\``;
    if (name === "read" || name === "write" || name === "ls" || name === "edit") return `\`${p}\``;
    if (name === "grep" || name === "find") return `\`${parsedArgs.pattern || ""}\`, \`${p || ""}\``;

    return Object.entries(parsedArgs)
      .map(([k, v]) => `**${k}**=${typeof v === "object" ? JSON.stringify(v) : v}`)
      .join(", ");
  };

  async function sendToDiscord(content: string) {
    if (!client || !client.isReady() || !USER_ID) return;
    try {
      const user = await client.users.fetch(USER_ID);
      const maxLength = 1900;
      
      if (content.length <= maxLength) {
        const sentMessage = await user.send(content);
        lastFinalOutputMessageId = sentMessage.id;
        return sentMessage;
      }

      // Chunking for long messages
      const chunks = [];
      let currentPos = 0;
      while (currentPos < content.length) {
        let chunk = content.substring(currentPos, currentPos + maxLength);
        
        if (currentPos + maxLength < content.length) {
          const lastNewline = chunk.lastIndexOf('\n');
          if (lastNewline > maxLength * 0.8) {
            chunk = content.substring(currentPos, currentPos + lastNewline);
          }
        }
        
        chunks.push(chunk);
        currentPos += chunk.length;
      }

      let lastSentMessage;
      for (const chunk of chunks) {
        lastSentMessage = await user.send(chunk);
      }
      if (lastSentMessage) {
        lastFinalOutputMessageId = lastSentMessage.id;
      }
      return lastSentMessage;
    } catch (error) {
      console.error("Failed to send to Discord:", error);
    }
  }

  async function initDiscord(ctx: ExtensionContext) {
    if (!DISCORD_TOKEN || !USER_ID) {
      console.error("Discord extension: DISCORD_TOKEN or USER_ID missing in ~/.pi/discord/.env");
      return;
    }

    client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
      ],
      partials: [Partials.Channel],
    });

    client.on(Events.ClientReady, () => {
      pi.ui?.notify(`Discord bot logged in as ${client?.user?.tag}`);
    });

    client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return;
      if (message.author.id !== USER_ID) return;

      // Handle tool call replies
      if (message.reference && message.reference.messageId) {
        const resolveReply = pendingReplies.get(message.reference.messageId);
        if (resolveReply) {
          resolveReply(message.content);
          pendingReplies.delete(message.reference.messageId);
          return;
        }

        // Handle replies to final output
        if (message.reference.messageId === lastFinalOutputMessageId) {
          pi.sendUserMessage(`[Discord Reply] ${message.content}`);
          return;
        }
      }

      // Handle spontaneous messages
      pi.sendMessage(
        {
          customType: "discord_message",
          content: `[Discord Message] ${message.author.username}: ${message.content}`,
          display: true,
        },
        { deliverAs: "steer", triggerTurn: true }
      );
    });

    await client.login(DISCORD_TOKEN);

    if (ctx.hasUI) {
      ctx.ui.setStatus("discord", ctx.ui.theme.fg("accent", "discord enabled"));
    }
  }

  pi.on("session_start", async (_event, ctx) => {
    if (pi.getFlag("discord")) {
      await initDiscord(ctx);
    } else {
      // Hide the tools if flag is not set
      pi.setActiveTools(pi.getActiveTools().filter(t => t !== "discordSendRequest" && t !== "discordSendMessage" && t !== "preamble"));
    }
  });

  pi.on("before_agent_start", async (event, ctx) => {
    if (!pi.getFlag("discord")) return;
    return {
      systemPrompt: event.systemPrompt + "\n\nNote: If you send a message via discordSendMessage that isn't directly in response to a previous ask message, it will be received by the user and any reply will be sent back to you as a steering message (interrupting your current work).\n\nKeep your speech concise, direct, and friendly. Communicate efficiently, always keeping the user clearly informed about ongoing actions without unnecessary detail. Prioritize actionable guidance, clearly stating assumptions, environment prerequisites, and next steps. Unless explicitly asked, avoid excessively verbose explanations about your work.\n\n### Preamble messages\n\nYou MUST call the `preamble` tool before doing anything else in your turn, and you MUST call it every time you start on a new subtask. This tool explains to the user what you’re about to do. Follow these principles:\n- **Logically group related actions**: if you’re about to run several related commands, describe them together in one preamble.\n- **Keep it concise**: be no more than 1-2 sentences, focused on immediate, tangible next steps. (4-8 words for quick updates).\n- **Build on prior context**: use the preamble message to connect the dots with what’s been done so far.\n- **Exception**: Avoid adding a preamble for every trivial read unless it’s part of a larger grouped action.\n\n**Examples:**\n- “Exploring codebase”\n- “Locating main.rs file”\n- “Verifying git status”\n- “Patching config and updating tests”\n- “Scaffolding CLI commands”"
    };
  });

  pi.on("turn_end", async (event, ctx) => {
    if (!pi.getFlag("discord") || !client || !client.isReady()) return;

    const { message } = event;

    if (message.role === "assistant") {
      // 2. Text content
      const textContent = message.content
        .filter((c: any) => c.type === "text")
        .map((c: any) => c.text)
        .join("\n")
        .trim();
      
      if (textContent) {
        await sendToDiscord(textContent);
      }
    }
  });

  pi.on("session_shutdown", async () => {
    if (client) {
      await client.destroy();
      client = null;
    }
  });

  pi.registerTool({
    name: "preamble",
    label: "Preamble",
    description: "Send a brief preamble message to the user explaining what you're about to do. Use this before running a set of commands. You MUST use this to explain your current focus to the user before taking any action, and MUST call it again to update the user as you progress. (Of course, you shouldn't spam by calling this before *every* tool call, but once your overall focus shifts, or at the very start of your turn, it's time to update the preamble.)",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "The preamble content (e.g., 'Exploring codebase')." },
      },
      required: ["content"],
    },
    async execute(toolCallId, { content }) {
      await sendToDiscord(`→ *${content}*`);
      return {
        content: [{ type: "text", text: `Preamble sent: ${content}` }],
      };
    },
  });

  pi.registerTool({
    name: "discordSendMessage",
    label: "Discord Send",
    description: "Sends a Discord message to the user without waiting for a reply. Use this for notifications or when you don't need an immediate response.",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "The message content to send." },
      },
      required: ["content"],
    },
    async execute(toolCallId, { content }) {
      if (!client || !client.isReady()) {
        return "Discord bot is not initialized or ready.";
      }

      try {
        await sendToDiscord(content);
        return {
          content: [{ type: "text", text: "Message sent to Discord." }],
        };
      } catch (error: any) {
        return {
          content: [{ type: "text", text: `Failed to send Discord message: ${error.message}` }],
        };
      }
    },
  });

  pi.registerTool({
    name: "discordSendRequest",
    label: "Discord Request",
    description: "Sends a Discord message to the user and waits for a reply. Use this when you need information from the user before proceeding.",
    parameters: {
      type: "object",
      properties: {
        content: { type: "string", description: "The message content to send." },
      },
      required: ["content"],
    },
    async execute(toolCallId, { content }) {
      if (!client || !client.isReady()) {
        return "Discord bot is not initialized or ready.";
      }

      try {
        const sentMessage = await sendToDiscord(content);
        if (!sentMessage) return "Failed to send message.";

        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            pendingReplies.delete(sentMessage.id);
            resolve({
              content: [{ type: "text", text: "Timed out waiting for a reply on Discord." }],
            });
          }, 300000); // 5 minute timeout

          pendingReplies.set(sentMessage.id, (replyContent) => {
            clearTimeout(timeout);
            resolve({
              content: [{ type: "text", text: `User replied on Discord: ${replyContent}` }],
            });
          });
        });
      } catch (error: any) {
        return {
          content: [{ type: "text", text: `Failed to send Discord message: ${error.message}` }],
        };
      }
    },
  });
};

export default discordExtension;
