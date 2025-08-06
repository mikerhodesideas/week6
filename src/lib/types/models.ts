// src/lib/types/models.ts

export type LLMProvider = 'openai' | 'anthropic' | 'gemini'

export interface TokenUsage {
    inputTokens: number
    outputTokens: number
    totalTokens?: number
    cost?: number
}

export interface LLMResponse {
    content: string
    usage?: TokenUsage
    provider?: LLMProvider
    model?: string
}

export interface GenerateInsightsOptions {
    prompt: string
    data: any[]
    dataSource: string
    filters: string[]
    totalRows: number
    analyzedRows: number
    currency: string
    provider?: LLMProvider
    model?: string
}

export interface InsightRequest {
    prompt: string
    data: any[]
    dataSource: string
    filters: string[]
    totalRows: number
    analyzedRows: number
    currency: string
    provider: LLMProvider
    model: string
    apiKey?: string
}

export interface LLMModel {
    id: string
    name: string
    provider: LLMProvider
    apiModel: string // The actual model name to use in API calls
}

export interface ModelPricing {
    input: number  // Cost per 1M tokens
    output: number // Cost per 1M tokens
}

// Model configurations
export const AVAILABLE_MODELS: LLMModel[] = [
    // OpenAI Models
    { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', provider: 'openai', apiModel: 'gpt-4.1-mini-2025-04-14' },
    { id: 'gpt-4.1', name: 'GPT-4.1', provider: 'openai', apiModel: 'gpt-4.1-2025-04-14' },
    { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', provider: 'openai', apiModel: 'gpt-4.1-nano-2025-04-14' },
    
    // Anthropic Models
    { id: 'claude-sonnet-4', name: 'Claude 4 Sonnet', provider: 'anthropic', apiModel: 'claude-sonnet-4-20250514' },
    { id: 'claude-opus-4', name: 'Claude 4 Opus', provider: 'anthropic', apiModel: 'claude-opus-4-20250514' },
    
    // Gemini Models
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'gemini', apiModel: 'gemini-2.5-pro' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'gemini', apiModel: 'gemini-2.5-flash' },
]

// Pricing per 1M tokens (updated 2025 pricing)
export const OPENAI_PRICING: Record<string, ModelPricing> = {
    'gpt-4.1-2025-04-14': { input: 2.00, output: 8.00 },
    'gpt-4.1-mini-2025-04-14': { input: 0.40, output: 1.60 },
    'gpt-4.1-nano-2025-04-14': { input: 0.10, output: 0.40 },
}

export const ANTHROPIC_PRICING: Record<string, ModelPricing> = {
    'claude-sonnet-4-20250514': { input: 3.00, output: 15.00 },
    'claude-opus-4-20250514': { input: 15.00, output: 75.00 },
}

export const GEMINI_PRICING: Record<string, ModelPricing> = {
    'gemini-2.5-pro': { input: 3.50, output: 10.50 },
    'gemini-2.5-flash': { input: 0.075, output: 0.30 },
}

// Default model
export const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini-2025-04-14'

// Helper functions for model operations
export function getApiModelName(modelId: string): string {
    const model = AVAILABLE_MODELS.find(m => m.id === modelId)
    return model?.apiModel || DEFAULT_OPENAI_MODEL
}

export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    let pricing = OPENAI_PRICING[model] || ANTHROPIC_PRICING[model] || GEMINI_PRICING[model]
    if (!pricing) return 0

    const inputCost = (inputTokens / 1000000) * pricing.input
    const outputCost = (outputTokens / 1000000) * pricing.output
    return inputCost + outputCost
} 