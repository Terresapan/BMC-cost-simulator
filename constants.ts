import { PricingMap } from './types';

export const MODEL_PRICING: PricingMap = {
    "gemini-2.5-pro": { input: 1.25, output: 10.0, label: "Gemini 2.5 Pro" },
    "gemini-2.5-flash": { input: 0.3, output: 2.5, label: "Gemini 2.5 Flash" },
    "gemini-2.5-flash-lite": { input: 0.1, output: 0.4, label: "Gemini 2.5 Flash Lite" },
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
