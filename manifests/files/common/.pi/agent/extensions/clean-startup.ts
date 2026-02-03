import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    if (!ctx.hasUI) return;

    // Use a custom UI component to get access to the TUI instance and its children.
    // We call done() immediately so it doesn't block the UI.
    ctx.ui.custom((tui, _theme, _kb, done) => {
      // Iterate through TUI children to find the chat container.
      for (const child of tui.children) {
        // We look for Containers. The chatContainer is a Container.
        if (child.constructor.name === "Container") {
          const container = child as any;
          const toRemove: any[] = [];

          // Look for children that render the "Loaded ..." strings.
          for (let i = 0; i < container.children.length; i++) {
            const grandchild = container.children[i];
            try {
              // Render with a reasonable width to check content.
              const rendered = grandchild.render(120).join("\n");
              if (
                rendered.includes("Loaded context:") ||
                rendered.includes("Loaded skills:") ||
                rendered.includes("Skill warnings:") ||
                rendered.includes("Loaded prompt templates:") ||
                rendered.includes("Loaded extensions:")
              ) {
                toRemove.push(grandchild);
                
                // Also remove the next child if it's a Spacer.
                const nextChild = container.children[i + 1];
                if (nextChild && nextChild.constructor.name === "Spacer") {
                  toRemove.push(nextChild);
                }
              }
            } catch (e) {
              // Ignore rendering errors for non-standard components
            }
          }

          // Remove the identified components from the container.
          for (const item of toRemove) {
            container.removeChild(item);
          }
        }
      }

      // Signal that our "custom UI" is done immediately.
      done(true);
      
      // Return a dummy component.
      return {
        render: () => [],
        invalidate: () => {},
        handleInput: () => {},
      };
    });
  });
}
