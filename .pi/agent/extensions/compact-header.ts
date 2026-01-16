/**
 * Compact Header Extension
 * Replaces the built-in header with just the Pi logo.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	pi.on("session_start", async (_event, ctx) => {
		if (!ctx.hasUI) return;

		ctx.ui.setHeader((_tui, theme) => ({
			render(): string[] {
				return [
					" ██████",
					" ██  ██",
					" ████  ██",
					" ██    ██",
				];
			},
			invalidate() {},
		}));
	});
}
