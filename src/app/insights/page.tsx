// src/app/insights/page.tsx
'use client'
import { Database, Filter, Table, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { DataFilters } from '@/components/DataFilters'
import { DataPreviewTable } from '@/components/DataPreviewTable'
import { DataSummary } from '@/components/DataSummary'
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

        // Filtering
        filters,
        addFilter,
        updateFilter,
        removeFilter,

        // Sorting and preview
        sortConfig,
        setSortConfig,
        previewRowCount,
        setPreviewRowCount,

        // Processed data
        filteredData,
        previewData,
        dataSummary,

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
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading data...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (dataError) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="text-red-500 mb-4">⚠️</div>
                        <h3 className="text-lg font-semibold mb-2">Data Loading Error</h3>
                        <p className="text-muted-foreground">{dataError}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Database className="h-6 w-6" />
                    <h1 className="text-3xl font-bold">Data Insights</h1>
                </div>
                <p className="text-muted-foreground text-lg">
                    Explore, analyze, and derive AI-powered insights from your advertising data
                </p>
            </div>

            {/* Data Source Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Table className="h-5 w-5" />
                        Data Source Selection
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label>Select Data Source</Label>
                        <Select value={selectedDataSource} onValueChange={setSelectedDataSource}>
                            <SelectTrigger className="w-full md:w-80">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {DATA_SOURCE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <div>
                                            <div className="font-medium">{option.label}</div>
                                            <div className="text-xs text-muted-foreground">{option.description}</div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="text-sm text-muted-foreground">
                            {filteredData.length.toLocaleString()} rows available for analysis
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <DataFilters
                filters={filters}
                columns={columns}
                onAddFilter={addFilter}
                onUpdateFilter={updateFilter}
                onRemoveFilter={removeFilter}
            />

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Data Preview and Summary */}
                <div className="space-y-6">
                    <DataPreviewTable
                        data={previewData}
                        columns={columns}
                        sortConfig={sortConfig}
                        onSort={setSortConfig}
                        previewRowCount={previewRowCount}
                        onPreviewRowCountChange={setPreviewRowCount}
                        totalRows={filteredData.length}
                    />

                    <DataSummary
                        summary={dataSummary}
                        columns={columns}
                    />
                </div>

                {/* Right Column - AI Insights */}
                <div>
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
        </div>
    )
} 