// src/app/insights/page.tsx
'use client'
import { Database, Sparkles, Brain, TrendingUp, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DataPreviewTable } from '@/components/DataPreviewTable'
import { AIInsights } from '@/components/AIInsights'
import { useDataInsights } from '@/hooks/useDataInsights'
import { DataSourceType } from '@/lib/types'

const DATA_SOURCE_OPTIONS: { value: DataSourceType; label: string; description: string }[] = [
    { value: 'searchTerms', label: 'Search Terms', description: 'Search query performance data' },
    { value: 'adGroups', label: 'Ad Groups', description: 'Ad group performance metrics' },
    { value: 'assetGroups', label: 'Asset Groups', description: 'Performance Max asset group data' },
    { value: 'daily', label: 'Daily Performance', description: 'Daily campaign performance' },
    { value: 'campaignStatus', label: 'Campaign Status', description: 'Campaign status and settings' },
    { value: 'landingPages', label: 'Landing Pages', description: 'Landing page performance data' }
]

export default function InsightsPage() {
    const {
        // Data source and loading
        selectedDataSource,
        setSelectedDataSource,
        isDataLoading,
        dataError,

        // Column management
        columns,

        // AI Analysis
        aiRowCount,
        setAiRowCount,

        // Sorting and preview
        sortConfig,
        setSortConfig,
        previewRowCount,
        setPreviewRowCount,

        // Processed data
        filteredData,
        previewData,

        // AI Insights
        prompt,
        setPrompt,
        selectedModel,
        setSelectedModel,
        selectedProvider,
        setSelectedProvider,
        insights,
        tokenUsage,
        isGeneratingInsights,
        insightsError,
        generateInsights
    } = useDataInsights()

    const canGenerateInsights = prompt.trim().length > 0 && filteredData.length > 0

    if (isDataLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <div className="container mx-auto p-6">
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="relative mb-8">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Brain className="h-6 w-6 text-indigo-600" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Intelligence</h3>
                            <p className="text-gray-600">Preparing your data for AI analysis...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (dataError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
                <div className="container mx-auto p-6">
                    <div className="flex items-center justify-center h-96">
                        <Card className="max-w-md shadow-2xl border-red-200 bg-white/90 backdrop-blur-sm">
                            <CardContent className="p-8 text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Database className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-red-900 mb-3">Data Connection Issue</h3>
                                <p className="text-red-700 mb-4">{dataError}</p>
                                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                                    Please check your data source configuration
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
            <div className="container mx-auto p-6 space-y-8">
                {/* Hero Header */}
                <div className="text-center py-12">
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative">
                            <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
                                <Brain className="w-10 h-10 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                <Sparkles className="w-3 h-3 text-white" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                        AI Data Insights
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Transform your advertising data into actionable intelligence with advanced AI analysis and intuitive visualizations
                    </p>
                    <div className="flex items-center justify-center mt-6 gap-8 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Real-time Analysis</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-indigo-500" />
                            <span>Performance Tracking</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-purple-500" />
                            <span>AI-Powered</span>
                        </div>
                    </div>
                </div>

                {/* Data Source Selection */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                                <Database className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <div className="text-gray-800">Data Source</div>
                                <div className="text-sm font-normal text-gray-500">Choose your dataset for analysis</div>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">Select Data Source</Label>
                                    <Select value={selectedDataSource} onValueChange={setSelectedDataSource}>
                                        <SelectTrigger className="w-full border-2 border-gray-200 hover:border-indigo-300 transition-colors">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DATA_SOURCE_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <div className="py-1">
                                                        <div className="font-semibold text-gray-800">{option.label}</div>
                                                        <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-gray-700">Rows for AI Analysis</Label>
                                    <Input 
                                        type="number" 
                                        value={aiRowCount} 
                                        onChange={(e) => setAiRowCount(Number(e.target.value))}
                                        min={1}
                                        max={filteredData.length}
                                        className="border-2 border-gray-200 hover:border-indigo-300 transition-colors"
                                        placeholder="500"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 w-full">
                                        <div className="text-2xl font-bold text-green-700">
                                            {filteredData.length.toLocaleString()}
                                        </div>
                                        <div className="text-sm text-green-600 font-medium">rows available</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>


                {/* Data Preview */}
                <DataPreviewTable
                    data={previewData}
                    columns={columns}
                    sortConfig={sortConfig}
                    onSort={setSortConfig}
                    previewRowCount={previewRowCount}
                    onPreviewRowCountChange={setPreviewRowCount}
                    totalRows={filteredData.length}
                />

                {/* AI Insights */}
                <AIInsights
                    prompt={prompt}
                    onPromptChange={setPrompt}
                    selectedProvider={selectedProvider}
                    onProviderChange={setSelectedProvider}
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                    insights={insights}
                    tokenUsage={tokenUsage}
                    isGenerating={isGeneratingInsights}
                    error={insightsError}
                    onGenerate={generateInsights}
                    canGenerate={canGenerateInsights}
                />
            </div>
        </div>
    )
} 