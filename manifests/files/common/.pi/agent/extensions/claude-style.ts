import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { truncateToWidth, wrapTextWithAnsi } from "@mariozechner/pi-tui";
import * as path from "node:path";

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    if (!ctx.hasUI) return;

    ctx.ui.custom((tui, theme, _kb, done) => {
      const isAssistantComponent = (c: any) => 
        c.constructor.name === "AssistantMessageComponent" || 
        (typeof c.updateContent === 'function' && typeof c.setHideThinkingBlock === 'function');

      const isToolComponent = (c: any) => 
        c.constructor.name === "ToolExecutionComponent" || 
        (typeof c.updateResult === 'function' && typeof c.updateArgs === 'function');

      const getHexColor = (type: "success" | "error" | "successBg" | "errorBg" | "dim") => {
        if (type === "success") return "\x1b[38;2;78;186;101m";
        if (type === "error") return "\x1b[38;2;255;107;128m";
        if (type === "successBg") return "\x1b[48;2;34;92;43m";
        if (type === "errorBg") return "\x1b[48;2;122;41;54m";
        return theme.fg("dim", "");
      };

      const formatArgs = (name: string, args: any, theme: any) => {
        if (!args) return "";

        let p = args.path || args.file_path || "";
        if (p && path.isAbsolute(p)) {
          p = path.relative(ctx.cwd, p) || ".";
        }

        let argString = "";
        if (name === "bash") {
          argString = args.command || "";
        } else if (name === "read" || name === "write" || name === "ls" || name === "edit") {
          argString = p;
        } else if (name === "grep" || name === "find") {
          argString = `${args.pattern || ""}, ${p || ""}`;
        } else {
          argString = Object.entries(args)
            .map(([k, v]) => `${k}=${v}`)
            .join(", ");
        }

        return "(" + argString + ")";
      };

      const wrapBlock = (component: any, assistant: any) => {
        if (component._pi_wrapped_block) return;
        component._pi_wrapped_block = true;

        const originalRender = component.render.bind(component);
        let cachedWidth: number | undefined;
        let cachedResult: string[] | undefined;
        let lastMessageId: any;

        component.render = (width: number) => {
          const currentMessageId = assistant.lastMessage;
          if (cachedResult && cachedWidth === width && lastMessageId === currentMessageId) {
            return cachedResult;
          }

          const lines = originalRender(width - 1);
          
          let dotColor = "text";
          const message = assistant.lastMessage;
          if (message?.stopReason === "error" || message?.stopReason === "aborted") {
            dotColor = "error";
          }

          const dot = dotColor === "error" ? getHexColor("error") + "⏺\x1b[0m" : "⏺";

          const result = lines.map((line: string, i: number) => {
            const prefix = i === 0 ? dot : " ";
            const fullLine = prefix + line;
            return truncateToWidth(fullLine, width);
          });

          cachedWidth = width;
          cachedResult = result;
          lastMessageId = currentMessageId;
          return result;
        };

        const originalInvalidate = component.invalidate?.bind(component);
        component.invalidate = () => {
          originalInvalidate?.();
          cachedWidth = undefined;
          cachedResult = undefined;
        };
      };

      const patchAssistant = (assistant: any) => {
        if (assistant._pi_patched_assistant) return;
        assistant._pi_patched_assistant = true;

        const contentContainer = assistant.children[0];
        if (contentContainer && contentContainer.constructor.name === "Container") {
          const originalAddChild = contentContainer.addChild.bind(contentContainer);
          contentContainer.addChild = (child: any) => {
            if (child.constructor.name === "Markdown" || child.constructor.name === "Text") {
              wrapBlock(child, assistant);
            }
            return originalAddChild(child);
          };

          for (const block of contentContainer.children) {
            if (block.constructor.name === "Markdown" || block.constructor.name === "Text") {
              wrapBlock(block, assistant);
            }
          }
        }
      };

      const patchTool = (tool: any) => {
        if (tool._pi_patched_tool) return;
        tool._pi_patched_tool = true;

        const originalUpdateDisplay = tool.updateDisplay?.bind(tool);
        if (originalUpdateDisplay) {
          tool.updateDisplay = () => {
            originalUpdateDisplay();
            if (tool.contentBox) {
              tool.contentBox.setBgFn((s: string) => s);
              tool.contentBox.paddingX = 0;
              tool.contentBox.paddingY = 0;
            }
            if (tool.contentText) {
              tool.contentText.setCustomBgFn((s: string) => s);
              tool.contentText.paddingX = 0;
              tool.contentText.paddingY = 0;
            }
          };
          tool.updateDisplay();
        }

        const originalRender = tool.render.bind(tool);
        let cachedWidth: number | undefined;
        let cachedResult: string[] | undefined;
        let lastResultId: any;
        let lastExpanded: boolean | undefined;
        let lastPartial: boolean | undefined;

        tool.render = (width: number) => {
          const currentResultId = tool.result;
          const currentExpanded = tool.expanded;
          const currentPartial = tool.isPartial;
          if (cachedResult && cachedWidth === width && lastResultId === currentResultId && lastExpanded === currentExpanded && lastPartial === currentPartial) {
            return cachedResult;
          }

          let dotType: "success" | "error" | "dim" = "dim";
          if (!tool.isPartial) {
            dotType = tool.result?.isError ? "error" : "success";
          }

          let toolName = tool.toolName.charAt(0).toUpperCase() + tool.toolName.slice(1);
          if (tool.toolName === "edit") toolName = "Update";

          const args = formatArgs(tool.toolName, tool.args, theme);
          const dot = dotType === "dim" ? theme.fg("dim", "⏺") : getHexColor(dotType) + "⏺\x1b[0m";
          const header = dot + " " + theme.bold(toolName) + " " + theme.fg("dim", args);

          let result: string[] = [];
          const rawHeaderLines = wrapTextWithAnsi(header, width - 2);
          const headerLines = Array.isArray(rawHeaderLines) 
            ? rawHeaderLines.map((line, i) => i === 0 ? line : "  " + line)
            : [rawHeaderLines];

          // Always show header, even if partial/executing
          result = ["", ...headerLines];

          if (tool.toolName === "read") {
            if (tool.isPartial) {
              result.push(` ⎿ ${theme.fg("dim", "reading...")}`);
              cachedWidth = width;
              cachedResult = result;
              lastResultId = currentResultId;
              lastExpanded = currentExpanded;
              lastPartial = currentPartial;
              return result;
            } else if (!tool.result?.isError) {
              const output = tool.getTextOutput() || "";
              const lines = output.split('\n');
              const lineCount = lines.length;
              result.push(` ⎿ ${theme.fg("dim", `Read ${lineCount} lines`)}`);
              cachedWidth = width;
              cachedResult = result;
              lastResultId = currentResultId;
              lastExpanded = currentExpanded;
              lastPartial = currentPartial;
              return result;
            }
          }

          if (result.length === 0) {
            // For partial/executing tools, try to show any partial output
            if (tool.isPartial) {
              const partialOutput = tool.getTextOutput?.() || "";
              if (partialOutput.trim()) {
                const lines = partialOutput.split('\n').slice(0, 10); // Show first 10 lines
                let contentStarted = false;
                for (const line of lines) {
                  if (!contentStarted && line.trim() === "") continue;
                  const prefix = !contentStarted ? " ⎿ " : "   ";
                  result.push(truncateToWidth(prefix + line, width));
                  contentStarted = true;
                }
              }
              if (!result.find(l => l.includes("⎿"))) {
                result.push(` ⎿ ${theme.fg("dim", "executing...")}`);
              }
              cachedWidth = width;
              cachedResult = result;
              lastResultId = currentResultId;
              lastExpanded = currentExpanded;
              lastPartial = currentPartial;
              return result;
            }

            const originalLines = originalRender(width - 4);
            const outputText = tool.getTextOutput() || "";
            const outputLines = outputText.split("\n").map(l => l.replace(/\x1b\[[0-9;]*m/g, '').trim()).filter(l => l !== "");
            const marker = outputLines[0];
            
            let skipCount = 0;
            if (marker) {
              for (let i = 0; i < Math.min(originalLines.length, 20); i++) {
                const plain = originalLines[i].replace(/\x1b\[[0-9;]*m/g, '').trim();
                if (plain.includes(marker) || (marker.length > 20 && plain.includes(marker.substring(0, 20)))) {
                  skipCount = i;
                  break;
                }
              }
            }

            // Fallback to old logic if marker not found or no output
            if (skipCount === 0) {
              for (let i = 0; i < Math.min(originalLines.length, 15); i++) {
                const line = originalLines[i];
                const plain = line.replace(/\x1b\[[0-9;]*m/g, '');
                const trimmed = plain.trim();
                
                if (trimmed === "" && i > 0 && i < 10) {
                  skipCount = i + 1;
                  break;
                }
                
                const lower = trimmed.toLowerCase();
                if (lower.includes(tool.toolName.toLowerCase()) || lower.startsWith("$ ") || lower.startsWith("> $ ")) {
                  skipCount = i + 1;
                  for (let j = i + 1; j < Math.min(originalLines.length, 15); j++) {
                    const nextLine = originalLines[j];
                    const nextPlain = nextLine.replace(/\x1b\[[0-9;]*m/g, '');
                    if (nextPlain.trim() === "" || (!nextPlain.startsWith("  ") && !nextPlain.startsWith("\t"))) {
                      skipCount = j + 1;
                      break;
                    }
                    skipCount = j + 1;
                  }
                  break;
                }
              }
            }

            const contentLines = originalLines.slice(skipCount);
            result = ["", ...headerLines];
            
            let contentStarted = false;
            let activeDiffBgColor: string | null = null;

            for (let i = 0; i < contentLines.length; i++) {
              let line = contentLines[i];
              const plainLine = line.replace(/\x1b\[[0-9;]*m/g, '');
              if (!contentStarted && plainLine.trim() === "") continue;

              if (tool.toolName === "edit") {
                const match = plainLine.match(/^([+-])(\s*\d*)\s(.*)$/);
                if (match) {
                  const [_, sign, lineNum, rest] = match;
                  activeDiffBgColor = sign === "+" ? getHexColor("successBg") : getHexColor("errorBg");
                  const dotColor = sign === "+" ? getHexColor("success") : getHexColor("error");
                  line = activeDiffBgColor + dotColor + sign + theme.fg("dim", lineNum) + "\x1b[0m" + activeDiffBgColor + " " + rest + "\x1b[0m";
                } else {
                  const contextMatch = plainLine.match(/^(\s)(\s*\d*)\s(.*)$/);
                  if (contextMatch) {
                    const [_, sign, lineNum, rest] = contextMatch;
                    activeDiffBgColor = null;
                    line = " " + theme.fg("dim", lineNum) + " " + rest;
                  } else if (activeDiffBgColor) {
                    // This is a continuation of a wrapped diff line
                    line = activeDiffBgColor + "   " + plainLine + "\x1b[0m";
                  }
                }
              }
              
              const prefix = !contentStarted ? " ⎿ " : "   ";
              result.push(truncateToWidth(prefix + line, width));
              contentStarted = true;
            }

            // If no content lines were added, show (no output)
            if (!contentStarted) {
              if (tool.result?.isError) {
                const errorText = tool.getTextOutput() || "";
                if (errorText.includes("Validation failed")) {
                  result.push(truncateToWidth(" ⎿ " + theme.fg("error", "Validation failed"), width));
                } else {
                  result.push(truncateToWidth(" ⎿ " + theme.fg("error", errorText), width));
                }
              } else {
                result.push(truncateToWidth(" ⎿ " + theme.fg("dim", "(no output)"), width));
              }
            }
          }

          cachedWidth = width;
          cachedResult = result;
          lastResultId = currentResultId;
          lastExpanded = currentExpanded;
          lastPartial = currentPartial;
          return result;
        };

        const originalInvalidate = tool.invalidate?.bind(tool);
        tool.invalidate = () => {
          originalInvalidate?.();
          cachedWidth = undefined;
          cachedResult = undefined;
        };
      };

      for (const child of tui.children) {
        if (child.constructor.name === "Container") {
          const container = child as any;
          for (const grandchild of container.children) {
            if (isAssistantComponent(grandchild)) {
              patchAssistant(grandchild);
            } else if (isToolComponent(grandchild)) {
              patchTool(grandchild);
            }
          }

          if (!container._pi_patched_chat) {
            container._pi_patched_chat = true;
            const originalAddChild = container.addChild.bind(container);
            container.addChild = (child: any) => {
              if (isAssistantComponent(child)) {
                patchAssistant(child);
              } else if (isToolComponent(child)) {
                patchTool(child);
              }
              return originalAddChild(child);
            };
          }
        }
      }

      done(true);
      return { render: () => [], invalidate: () => {}, handleInput: () => {} };
    });
  });
}
