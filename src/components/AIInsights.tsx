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
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
        <Card className="bg-purple-50/50 border-purple-200">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Insights Generation
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                    Generate contextual insights from your filtered data using Large Language Models
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Input Row: Prompt (50%) + Provider (25%) + Model (25%) + Generate Button */}
                <div className="grid grid-cols-12 gap-4 items-end">
                    {/* Prompt - 50% width */}
                    <div className="col-span-6 space-y-2">
                        <Label>Prompt</Label>
                        <Textarea
                            value={prompt}
                            onChange={(e) => onPromptChange(e.target.value)}
                            placeholder="Enter your analysis prompt here... e.g., 'What are the key trends in this data?'"
                            className="min-h-[100px] border-2 border-gray-200 hover:border-indigo-300 transition-colors"
                        />
                    </div>

                    {/* Provider - 25% width */}
                    <div className="col-span-3 space-y-2">
                        <Label>AI Provider</Label>
                        <Select value={selectedProvider} onValueChange={onProviderChange}>
                            <SelectTrigger className="border-2 border-gray-200 hover:border-indigo-300 transition-colors">
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

                    {/* Model - 25% width */}
                    <div className="col-span-3 space-y-2">
                        <Label>Model</Label>
                        <Select value={selectedModel} onValueChange={onModelChange}>
                            <SelectTrigger className="border-2 border-gray-200 hover:border-indigo-300 transition-colors">
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

                {/* Generate Button Row */}
                <div className="flex justify-center">
                    <Button
                        onClick={onGenerate}
                        disabled={!canGenerate || isGenerating}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200 px-8 py-3 text-lg font-semibold"
                        size="lg"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Generating Insights...
                            </>
                        ) : (
                            <>
                                <Zap className="h-5 w-5 mr-2" />
                                Generate AI Insights
                            </>
                        )}
                    </Button>
                </div>

                {/* Helper Text */}
                <div className="text-xs text-muted-foreground text-center">
                    💡 Tip: Be specific about what insights you're looking for to get better results.
                </div>

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

                        <div className="p-6 border rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-sm">
                            <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-indigo-900">{children}</h1>,
                                        h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-indigo-800">{children}</h2>,
                                        h3: ({ children }) => <h3 className="text-md font-medium mb-2 text-indigo-700">{children}</h3>,
                                        p: ({ children }) => <p className="mb-3 text-gray-700 leading-relaxed">{children}</p>,
                                        ul: ({ children }) => <ul className="mb-3 ml-4 space-y-1">{children}</ul>,
                                        ol: ({ children }) => <ol className="mb-3 ml-4 space-y-1">{children}</ol>,
                                        li: ({ children }) => <li className="text-gray-700">{children}</li>,
                                        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                                        em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
                                        blockquote: ({ children }) => <blockquote className="border-l-4 border-indigo-300 pl-4 italic text-gray-600 my-3">{children}</blockquote>,
                                        code: ({ children }) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-indigo-800">{children}</code>,
                                        pre: ({ children }) => <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto my-3">{children}</pre>
                                    }}
                                >
                                    {insights}
                                </ReactMarkdown>
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