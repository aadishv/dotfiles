import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { visibleWidth } from "@mariozechner/pi-tui";

export default function (pi: ExtensionAPI) {
  let frameCount = 0;
  let fps = 0;
  let lastFpsUpdate = performance.now();
  let enabled = false;
  let stressMode = false;
  let interval: ReturnType<typeof setInterval> | null = null;

  pi.registerCommand("fps", {
    description: "Toggle FPS counter",
    handler: async (_args, ctx) => {
      enabled = !enabled;
      if (enabled) {
        ctx.ui.notify("FPS counter enabled", "info");
        
        ctx.ui.setFooter((tui, theme, footerData) => {
          return {
            invalidate() {},
            render(width: number): string[] {
              const now = performance.now();
              frameCount++;
              if (now - lastFpsUpdate >= 1000) {
                fps = Math.round((frameCount * 1000) / (now - lastFpsUpdate));
                frameCount = 0;
                lastFpsUpdate = now;
              }

              const fpsColor = fps >= 60 ? "success" : fps >= 30 ? "accent" : fps >= 15 ? "warning" : "error";
              const fpsText = theme.fg(fpsColor, ` ${fps.toString().padStart(3)} FPS `);
              
              const modelInfo = theme.fg("dim", ctx.model?.id || "no-model");
              const branch = footerData.getGitBranch();
              const branchStr = branch ? theme.fg("muted", `  ${branch}`) : "";
              
              const left = fpsText + (stressMode ? theme.fg("error", " [STRESS]") : "");
              const right = modelInfo + branchStr;
              const pad = " ".repeat(Math.max(0, width - visibleWidth(fpsText) - visibleWidth(right)));
              
              if (stressMode) {
                // Request next frame immediately
                setTimeout(() => tui.requestRender(), 0);
              }

              return [fpsText + pad + right];
            },
          };
        });
      } else {
        stressMode = false;
        ctx.ui.setFooter(undefined);
        ctx.ui.notify("FPS counter disabled", "info");
      }
    },
  });

  pi.registerCommand("fps-stress", {
    description: "Toggle FPS stress test (force constant re-render)",
    handler: async (_args, ctx) => {
      if (!enabled) {
        ctx.ui.notify("Enable FPS counter first with /fps", "warning");
        return;
      }
      stressMode = !stressMode;
      ctx.ui.notify(`FPS stress test ${stressMode ? "enabled" : "disabled"}`, "info");
    }
  });
}
