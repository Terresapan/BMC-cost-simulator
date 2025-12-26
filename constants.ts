import { PricingMap } from './types';

export const MODEL_PRICING: PricingMap = {
    // Gemini 2.5 Series
    "gemini-2.5-pro": { input: 1.25, output: 10.0, label: "Gemini 2.5 Pro" },
    "gemini-2.5-flash": { input: 0.3, output: 2.5, label: "Gemini 2.5 Flash" },
    "gemini-2.5-flash-lite": { input: 0.1, output: 0.4, label: "Gemini 2.5 Flash Lite" },
    // Gemini 3 Series
    "gemini-3-pro": { input: 2.0, output: 12.0, label: "Gemini 3 Pro" },
    "gemini-3-flash": { input: 0.5, output: 3.0, label: "Gemini 3 Flash" },
};

export const EMBED_PRICE = 0.15; // Per 1M tokens
export const VCPU_COST = 0.000024; // Per second
export const MEM_COST = 0.0000025; // Per second per GB

// Google Search Grounding
export const SEARCH_PRICE_PER_1K = 35.00;
export const SEARCH_FREE_TIER_DAILY = 1500;

// Infrastructure Costs (Estimated Avg)
export const STORAGE_REGISTRY_COST = 0.10; // $0.10 per GB (Artifact Registry)
export const STORAGE_DB_COST = 0.20; // $0.20 per GB (Avg MongoDB/Cloud Storage)
export const NETWORKING_COST = 0.12; // $0.12 per GB (Egress)

// Proactive Agent Architecture
// Each trace triggers: 1 main conversation + 1 memory extraction + 1 proactive suggestion
export const BACKGROUND_LLM_CALLS_PER_TRACE = 2; // memory extraction + proactive suggestion
export const BACKGROUND_TOKENS_RATIO = 0.3; // Background calls use ~30% of main conversation tokens

// LLM-as-a-Judge Evaluation
export const EVAL_MODEL_DEFAULT = "gemini-2.5-flash"; // Used for evaluation
export const EVAL_TOKENS_PER_RUN = 2000; // Avg tokens per evaluation run
export const EVAL_RUNS_PER_TRACE_DEFAULT = 0.1; // Sample 10% of traces for evaluation
