// src/lib/api-router.ts
import type { LLMProvider, LLMResponse, GenerateInsightsOptions, InsightRequest } from './types/models'

export async function generateInsightsWithProvider(options: GenerateInsightsOptions): Promise<LLMResponse> {
    console.log('🚀 Generating insights with provider:', options.provider)
    console.log('📊 Data summary:', {
        dataSource: options.dataSource,
        totalRows: options.totalRows,
        analyzedRows: options.analyzedRows,
        filtersCount: options.filters.length,
        promptLength: options.prompt.length
    })
    
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
    console.log('🤖 Calling OpenAI API with model:', payload.model)
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
    console.log('🧠 Calling Anthropic API with model:', payload.model)
    try {
        const response = await fetch('/api/anthropic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: payload.model || 'claude-sonnet-4-20250514',
                system: systemPrompt,
                messages: [
                    { role: 'user', content: `${userPrompt}\n\nData: ${JSON.stringify(payload.data, null, 2)}` }
                ],
                max_tokens: 2000
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ Anthropic API call failed:', {
                status: response.status,
                statusText: response.statusText,
                errorText: errorText.substring(0, 500)
            })
            throw new Error(`Anthropic API error: ${response.status} - ${errorText.substring(0, 200)}`)
        }

        const result = await response.json()
        console.log('✅ Anthropic API result structure:', {
            hasContent: !!result.content,
            contentLength: result.content?.length,
            hasUsage: !!result.usage
        })

        // Safely parse Anthropic response
        let content = 'No response generated'
        if (result.content && Array.isArray(result.content) && result.content.length > 0) {
            content = result.content[0]?.text || 'No text in response'
        }

        return {
            content,
            usage: result.usage ? {
                inputTokens: result.usage.input_tokens || 0,
                outputTokens: result.usage.output_tokens || 0,
                totalTokens: (result.usage.input_tokens || 0) + (result.usage.output_tokens || 0)
            } : undefined,
            provider: 'anthropic',
            model: payload.model
        }
    } catch (error) {
        throw new Error(`Anthropic API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
}

async function callGemini(systemPrompt: string, userPrompt: string, payload: InsightRequest): Promise<LLMResponse> {
    console.log('💎 Calling Gemini API with model:', payload.model)
    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: payload.model || 'gemini-2.5-flash',
                contents: [{
                    parts: [{
                        text: `${systemPrompt}\n\n${userPrompt}\n\nData: ${JSON.stringify(payload.data, null, 2)}`
                    }]
                }],
                generationConfig: {
                    maxOutputTokens: 16000,
                    temperature: 0.7
                }
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ Gemini API call failed:', {
                status: response.status,
                statusText: response.statusText,
                errorText: errorText.substring(0, 500)
            })
            throw new Error(`Gemini API error: ${response.status} - ${errorText.substring(0, 200)}`)
        }

        const result = await response.json()

        // Safely parse Gemini response
        let content = 'No response generated'
        
        if (result.candidates && Array.isArray(result.candidates) && result.candidates.length > 0) {
            const candidate = result.candidates[0]
            
            // Check for blocked content first
            if (candidate.finishReason === 'SAFETY') {
                content = 'Response blocked for safety reasons'
            } else if (candidate.finishReason === 'MAX_TOKENS') {
                content = 'Response was cut off due to token limit'
            } else if (candidate?.content?.parts && Array.isArray(candidate.content.parts) && candidate.content.parts.length > 0) {
                const firstPart = candidate.content.parts[0]
                if (firstPart && typeof firstPart === 'object' && 'text' in firstPart) {
                    content = firstPart.text || 'Empty text response'
                } else {
                    content = 'No text property found in response part'
                }
            } else {
                content = 'No content parts found in candidate'
            }
        } else {
            content = 'No candidates found in response'
        }

        return {
            content,
            usage: result.usageMetadata ? {
                inputTokens: result.usageMetadata.promptTokenCount || 0,
                outputTokens: result.usageMetadata.candidatesTokenCount || 0,
                totalTokens: result.usageMetadata.totalTokenCount || 0
            } : undefined,
            provider: 'gemini',
            model: payload.model
        }
    } catch (error) {
        throw new Error(`Gemini API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
} 