// src/lib/api-router.ts
import type { LLMProvider, LLMResponse, GenerateInsightsOptions, InsightRequest } from './types/models'

export async function generateInsightsWithProvider(options: GenerateInsightsOptions): Promise<LLMResponse> {
    const { prompt, data, dataSource, filters, totalRows, analyzedRows, currency, provider = 'openai', model = 'gpt-4.1-mini-2025-04-14' } = options

    // Prepare context for the AI
    const context = {
        dataSource,
        filters: filters.length > 0 ? filters : ['No filters applied'],
        totalRows,
        analyzedRows,
        currency,
        sampleData: data.slice(0, 10) // Include a sample for context
    }

    const systemPrompt = `You are an expert digital marketing analyst specializing in Google Ads performance analysis. 
You have been provided with advertising data and asked to provide insights.

Data Context:
- Data Source: ${context.dataSource}
- Applied Filters: ${context.filters.join(', ')}
- Total Rows in Original Dataset: ${context.totalRows}
- Rows Being Analyzed: ${context.analyzedRows}
- Currency: ${context.currency}

Please provide actionable insights, trends, and recommendations based on the data provided.`

    const payload: InsightRequest = {
        prompt,
        data,
        dataSource,
        filters,
        totalRows,
        analyzedRows,
        currency,
        provider,
        model
    }

    switch (provider) {
        case 'openai':
            return await callOpenAI(systemPrompt, prompt, payload)
        case 'anthropic':
            return await callAnthropic(systemPrompt, prompt, payload)
        case 'gemini':
            return await callGemini(systemPrompt, prompt, payload)
        default:
            throw new Error(`Unsupported provider: ${provider}`)
    }
}

async function callOpenAI(systemPrompt: string, userPrompt: string, payload: InsightRequest): Promise<LLMResponse> {
    try {
        const response = await fetch('/api/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: payload.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `${userPrompt}\n\nData: ${JSON.stringify(payload.data, null, 2)}` }
                ],
                max_tokens: 2000,
                temperature: 0.7
            })
        })

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.statusText}`)
        }

        const result = await response.json()

        return {
            content: result.choices[0]?.message?.content || 'No response generated',
            usage: result.usage ? {
                inputTokens: result.usage.prompt_tokens,
                outputTokens: result.usage.completion_tokens,
                totalTokens: result.usage.total_tokens
            } : undefined,
            provider: 'openai',
            model: payload.model
        }
    } catch (error) {
        throw new Error(`OpenAI API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

async function callAnthropic(systemPrompt: string, userPrompt: string, payload: InsightRequest): Promise<LLMResponse> {
    try {
        const response = await fetch('/api/anthropic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: payload.model || 'claude-3-sonnet-20240229',
                system: systemPrompt,
                messages: [
                    { role: 'user', content: `${userPrompt}\n\nData: ${JSON.stringify(payload.data, null, 2)}` }
                ],
                max_tokens: 2000
            })
        })

        if (!response.ok) {
            throw new Error(`Anthropic API error: ${response.statusText}`)
        }

        const result = await response.json()

        return {
            content: result.content[0]?.text || 'No response generated',
            usage: result.usage ? {
                inputTokens: result.usage.input_tokens,
                outputTokens: result.usage.output_tokens,
                totalTokens: result.usage.input_tokens + result.usage.output_tokens
            } : undefined,
            provider: 'anthropic',
            model: payload.model
        }
    } catch (error) {
        throw new Error(`Anthropic API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

async function callGemini(systemPrompt: string, userPrompt: string, payload: InsightRequest): Promise<LLMResponse> {
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${systemPrompt}\n\n${userPrompt}\n\nData: ${JSON.stringify(payload.data, null, 2)}`
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: 2000,
                    temperature: 0.7
                }
            })
        })

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.statusText}`)
        }

        const result = await response.json()

        return {
            content: result.candidates[0]?.content?.parts[0]?.text || 'No response generated',
            usage: result.usageMetadata ? {
                inputTokens: result.usageMetadata.promptTokenCount,
                outputTokens: result.usageMetadata.candidatesTokenCount,
                totalTokens: result.usageMetadata.totalTokenCount
            } : undefined,
            provider: 'gemini',
            model: payload.model
        }
    } catch (error) {
        throw new Error(`Gemini API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
} 