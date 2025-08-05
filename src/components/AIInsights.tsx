// src/components/AIInsights.tsx
'use client'
import { useState } from 'react'
import { Loader2, Brain, Zap } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { LLMProvider, AVAILABLE_MODELS, TokenUsage } from '@/lib/types/models'

interface AIInsightsProps {
    prompt: string
    onPromptChange: (prompt: string) => void
    selectedProvider: LLMProvider
    onProviderChange: (provider: LLMProvider) => void
    selectedModel: string
    onModelChange: (modelId: string) => void
    insights: string | null
    tokenUsage: TokenUsage | null
    isGenerating: boolean
    error: string | null
    onGenerate: () => Promise<void>
    canGenerate: boolean
}

export function AIInsights({
    prompt,
    onPromptChange,
    selectedProvider,
    onProviderChange,
    selectedModel,
    onModelChange,
    insights,
    tokenUsage,
    isGenerating,
    error,
    onGenerate,
    canGenerate
}: AIInsightsProps) {
    const availableProviders: { value: LLMProvider; label: string; icon: string }[] = [
        { value: 'openai', label: 'OpenAI', icon: '🤖' },
        { value: 'anthropic', label: 'Anthropic', icon: '🧠' },
        { value: 'gemini', label: 'Google Gemini', icon: '💎' }
    ]

    const availableModels = AVAILABLE_MODELS.filter(model => model.provider === selectedProvider)

    const formatTokenUsage = (usage: TokenUsage) => {
        const parts = [
            `${usage.inputTokens?.toLocaleString() || 0} in`,
            `${usage.outputTokens?.toLocaleString() || 0} out`
        ]

        if (usage.totalTokens) {
            parts.push(`${usage.totalTokens.toLocaleString()} total`)
        }

        if (usage.cost) {
            parts.push(`$${usage.cost.toFixed(4)}`)
        }

        return parts.join(' • ')
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Insights Generation
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                    Generate contextual insights from your filtered data using Large Language Models
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Provider and Model Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>AI Provider</Label>
                        <Select value={selectedProvider} onValueChange={onProviderChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {availableProviders.map((provider) => (
                                    <SelectItem key={provider.value} value={provider.value}>
                                        <span className="flex items-center gap-2">
                                            <span>{provider.icon}</span>
                                            {provider.label}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Model</Label>
                        <Select value={selectedModel} onValueChange={onModelChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {availableModels.map((model) => (
                                    <SelectItem key={model.id} value={model.id}>
                                        {model.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Prompt Input */}
                <div className="space-y-2">
                    <Label>Prompt</Label>
                    <Textarea
                        value={prompt}
                        onChange={(e) => onPromptChange(e.target.value)}
                        placeholder="Enter your analysis prompt here... For example: 'What are the key trends in this data?' or 'Which search terms are underperforming and why?'"
                        className="min-h-[100px]"
                    />
                    <div className="text-xs text-muted-foreground">
                        Tip: Be specific about what insights you're looking for to get better results.
                    </div>
                </div>

                {/* Generate Button */}
                <Button
                    onClick={onGenerate}
                    disabled={!canGenerate || isGenerating}
                    className="w-full"
                    size="lg"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating Insights...
                        </>
                    ) : (
                        <>
                            <Zap className="h-4 w-4 mr-2" />
                            Generate Insights
                        </>
                    )}
                </Button>

                {/* Results Section */}
                {error && (
                    <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-700">
                        <div className="font-medium">Error generating insights</div>
                        <div className="text-sm mt-1">{error}</div>
                    </div>
                )}

                {insights && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">Generated Insights</h4>
                            {tokenUsage && (
                                <Badge variant="outline" className="text-xs">
                                    {formatTokenUsage(tokenUsage)}
                                </Badge>
                            )}
                        </div>

                        <div className="p-4 border rounded-lg bg-muted/50">
                            <div className="prose prose-sm max-w-none">
                                {insights.split('\n').map((paragraph, index) => {
                                    if (!paragraph.trim()) return <br key={index} />

                                    // Handle markdown-style formatting
                                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                        return (
                                            <h5 key={index} className="font-semibold mt-3 mb-1">
                                                {paragraph.slice(2, -2)}
                                            </h5>
                                        )
                                    }

                                    if (paragraph.startsWith('- ')) {
                                        return (
                                            <li key={index} className="ml-4">
                                                {paragraph.slice(2)}
                                            </li>
                                        )
                                    }

                                    return (
                                        <p key={index} className="mb-2">
                                            {paragraph}
                                        </p>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {!insights && !error && !isGenerating && (
                    <div className="text-center p-8 text-muted-foreground">
                        <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <div>Enter a prompt and click "Generate Insights" to analyze your data</div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 