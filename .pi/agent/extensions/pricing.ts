/**
 * Thread Pricing Extension
 *
 * Calculates the cost of the current thread using LiteLLM pricing data
 * and displays it in the status bar.
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { LiteLLMModelPricing } from "@mariozechner/pi-ai";

const LITELLM_PRICING_URL =
	"https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";

const DEFAULT_TIERED_THRESHOLD = 200_000;

interface LiteLLMModelPricingSchema {
	input_cost_per_token?: number;
	output_cost_per_token?: number;
	cache_creation_input_token_cost?: number;
	cache_read_input_token_cost?: number;
	input_cost_per_token_above_200k_tokens?: number;
	output_cost_per_token_above_200k_tokens?: number;
	cache_creation_input_token_cost_above_200k_tokens?: number;
	cache_read_input_token_cost_above_200k_tokens?: number;
}

interface TokenUsage {
	input_tokens: number;
	output_tokens: number;
	cache_creation_input_tokens?: number;
	cache_read_input_tokens?: number;
}

class LiteLLMPricingFetcher {
	private cachedPricing: Map<string, LiteLLMModelPricing> | null = null;

	private async fetchPricingData(): Promise<Map<string, LiteLLMModelPricing>> {
		if (this.cachedPricing) {
			return this.cachedPricing;
		}

		const response = await fetch(LITELLM_PRICING_URL);
		if (!response.ok) {
			throw new Error(`Failed to fetch pricing data: ${response.statusText}`);
		}

		const rawData = (await response.json()) as Record<string, unknown>;
		const pricing = new Map<string, LiteLLMModelPricing>();

		for (const [modelName, modelData] of Object.entries(rawData)) {
			if (typeof modelData !== "object" || modelData == null) {
				continue;
			}

			const parsed = this.parseModelPricing(modelData);
			if (parsed) {
				pricing.set(modelName, parsed);
			}
		}

		this.cachedPricing = pricing;
		return pricing;
	}

	private parseModelPricing(data: unknown): LiteLLMModelPricing | null {
		if (typeof data !== "object" || data == null) {
			return null;
		}

		const obj = data as Record<string, unknown>;
		return {
			input_cost_per_token: typeof obj.input_cost_per_token === "number" ? obj.input_cost_per_token : undefined,
			output_cost_per_token: typeof obj.output_cost_per_token === "number" ? obj.output_cost_per_token : undefined,
			cache_creation_input_token_cost:
				typeof obj.cache_creation_input_token_cost === "number" ? obj.cache_creation_input_token_cost : undefined,
			cache_read_input_token_cost:
				typeof obj.cache_read_input_token_cost === "number" ? obj.cache_read_input_token_cost : undefined,
			input_cost_per_token_above_200k_tokens:
				typeof obj.input_cost_per_token_above_200k_tokens === "number"
					? obj.input_cost_per_token_above_200k_tokens
					: undefined,
			output_cost_per_token_above_200k_tokens:
				typeof obj.output_cost_per_token_above_200k_tokens === "number"
					? obj.output_cost_per_token_above_200k_tokens
					: undefined,
			cache_creation_input_token_cost_above_200k_tokens:
				typeof obj.cache_creation_input_token_cost_above_200k_tokens === "number"
					? obj.cache_creation_input_token_cost_above_200k_tokens
					: undefined,
			cache_read_input_token_cost_above_200k_tokens:
				typeof obj.cache_read_input_token_cost_above_200k_tokens === "number"
					? obj.cache_read_input_token_cost_above_200k_tokens
					: undefined,
		};
	}

	private calculateTieredCost(
		totalTokens: number | undefined,
		basePrice: number | undefined,
		tieredPrice: number | undefined,
		threshold: number = DEFAULT_TIERED_THRESHOLD,
	): number {
		if (totalTokens == null || totalTokens <= 0) {
			return 0;
		}

		if (totalTokens > threshold && tieredPrice != null) {
			const tokensBelowThreshold = Math.min(totalTokens, threshold);
			const tokensAboveThreshold = Math.max(0, totalTokens - threshold);

			let cost = tokensAboveThreshold * tieredPrice;
			if (basePrice != null) {
				cost += tokensBelowThreshold * basePrice;
			}
			return cost;
		}

		if (basePrice != null) {
			return totalTokens * basePrice;
		}

		return 0;
	}

	calculateCost(tokens: TokenUsage, pricing: LiteLLMModelPricing): number {
		const inputCost = this.calculateTieredCost(
			tokens.input_tokens,
			pricing.input_cost_per_token,
			pricing.input_cost_per_token_above_200k_tokens,
		);

		const outputCost = this.calculateTieredCost(
			tokens.output_tokens,
			pricing.output_cost_per_token,
			pricing.output_cost_per_token_above_200k_tokens,
		);

		const cacheCreationCost = this.calculateTieredCost(
			tokens.cache_creation_input_tokens,
			pricing.cache_creation_input_token_cost,
			pricing.cache_creation_input_token_cost_above_200k_tokens,
		);

		const cacheReadCost = this.calculateTieredCost(
			tokens.cache_read_input_tokens,
			pricing.cache_read_input_token_cost,
			pricing.cache_read_input_token_cost_above_200k_tokens,
		);

		return inputCost + outputCost + cacheCreationCost + cacheReadCost;
	}

	async getModelPricing(modelName: string): Promise<LiteLLMModelPricing | null> {
		const pricing = await this.fetchPricingData();

		// Try direct match
		if (pricing.has(modelName)) {
			return pricing.get(modelName)!;
		}

		// Try with common prefixes
		const prefixes = ["anthropic/", "claude-3-5-", "claude-3-", "claude-"];
		for (const prefix of prefixes) {
			const withPrefix = `${prefix}${modelName}`;
			if (pricing.has(withPrefix)) {
				return pricing.get(withPrefix)!;
			}
		}

		// Try case-insensitive partial match
		const lower = modelName.toLowerCase();
		for (const [key, value] of pricing) {
			if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) {
				return value;
			}
		}

		return null;
	}

	async calculateThreadCost(modelName: string, tokens: TokenUsage): Promise<number> {
		const pricing = await this.getModelPricing(modelName);
		if (!pricing) {
			return 0;
		}
		return this.calculateCost(tokens, pricing);
	}
}

async function calculateSessionTokenUsage(ctx: ExtensionContext): Promise<{
	totalInput: number;
	totalOutput: number;
	totalCacheRead: number;
	totalCacheWrite: number;
	modelName: string | null;
}> {
	const entries = ctx.sessionManager.getEntries();
	let totalInput = 0;
	let totalOutput = 0;
	let totalCacheRead = 0;
	let totalCacheWrite = 0;
	let modelName: string | null = null;

	for (const entry of entries) {
		if (entry.type !== "message") continue;

		const message = entry.message;
		if (message.role !== "assistant") continue;

		// Get usage from assistant message
		const assistantMsg = message as { usage?: { input?: number; output?: number; cacheRead?: number; cacheWrite?: number } };
		if (assistantMsg.usage) {
			totalInput += assistantMsg.usage.input || 0;
			totalOutput += assistantMsg.usage.output || 0;
			totalCacheRead += assistantMsg.usage.cacheRead || 0;
			totalCacheWrite += assistantMsg.usage.cacheWrite || 0;
		}

		// Track model name from the message
		const modelMsg = message as { model?: string };
		if (modelMsg.model && !modelName) {
			modelName = modelMsg.model;
		}
	}

	return { totalInput, totalOutput, totalCacheRead, totalCacheWrite, modelName };
}

export default function (pi: ExtensionAPI) {
	const pricingFetcher = new LiteLLMPricingFetcher();
	const EXTENSION_KEY = "pricing";

	async function updatePriceDisplay(ctx: ExtensionContext): Promise<void> {
		try {
			const { totalInput, totalOutput, totalCacheRead, totalCacheWrite, modelName } =
				await calculateSessionTokenUsage(ctx);

			if (!modelName) {
				ctx.ui.setStatus(EXTENSION_KEY, undefined);
				return;
			}

			const cost = await pricingFetcher.calculateThreadCost(modelName, {
				input_tokens: totalInput,
				output_tokens: totalOutput,
				cache_creation_input_tokens: totalCacheWrite,
				cache_read_input_tokens: totalCacheRead,
			});

			const theme = ctx.ui.theme;
			const costFormatted = `$${cost.toFixed(4)}`;
			const label = theme.fg("dim", `api ${costFormatted}`);

			ctx.ui.setStatus(EXTENSION_KEY, label);
		} catch (error) {
			// Silently fail - pricing display is non-critical
			console.error("Failed to calculate thread cost:", error);
		}
	}

	// Update on session start
	pi.on("session_start", async (_event, ctx) => {
		await updatePriceDisplay(ctx);
	});

	// Update after each turn
	pi.on("turn_end", async (_event, ctx) => {
		await updatePriceDisplay(ctx);
	});

	// Update when model changes
	pi.on("model_select", async (_event, ctx) => {
		await updatePriceDisplay(ctx);
	});
}
