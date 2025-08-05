// src/hooks/useDataInsights.ts
'use client'
import { useState, useMemo, useCallback } from 'react'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { generateInsightsWithProvider } from '@/lib/api-router'
import {
    DataSourceType,
    ColumnDefinition,
    DataFilter,
    SortConfig,
    DataSummary,
    FILTER_OPERATORS,
    TabData
} from '@/lib/types'
import {
    LLMProvider,
    LLMResponse,
    AVAILABLE_MODELS
} from '@/lib/types/models'
import { DEFAULT_PREVIEW_ROWS, MAX_RECOMMENDED_INSIGHT_ROWS } from '@/lib/config'

export interface UseDataInsightsReturn {
    // Data source and loading
    selectedDataSource: DataSourceType
    setSelectedDataSource: (source: DataSourceType) => void
    isDataLoading: boolean
    dataError: string | null

    // Column management
    columns: ColumnDefinition[]

    // Filtering
    filters: DataFilter[]
    addFilter: () => void
    updateFilter: (id: string, updates: Partial<DataFilter>) => void
    removeFilter: (id: string) => void

    // Sorting and preview
    sortConfig: SortConfig | null
    setSortConfig: (config: SortConfig | null) => void
    previewRowCount: number
    setPreviewRowCount: (count: number) => void

    // Processed data
    filteredData: any[]
    sortedData: any[]
    previewData: any[]
    dataSummary: DataSummary

    // AI Insights
    prompt: string
    setPrompt: (prompt: string) => void
    selectedModel: string
    setSelectedModel: (modelId: string) => void
    selectedProvider: LLMProvider
    setSelectedProvider: (provider: LLMProvider) => void
    insights: string | null
    tokenUsage: any
    isGeneratingInsights: boolean
    insightsError: string | null
    generateInsights: () => Promise<void>
}

export function useDataInsights(): UseDataInsightsReturn {
    const { fetchedData, dataError: contextDataError, isDataLoading } = useSettings()

    // Core state
    const [selectedDataSource, setSelectedDataSource] = useState<DataSourceType>('searchTerms')
    const [filters, setFilters] = useState<DataFilter[]>([])
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)
    const [previewRowCount, setPreviewRowCount] = useState(DEFAULT_PREVIEW_ROWS)

    // AI state
    const [prompt, setPrompt] = useState('')
    const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0]?.id || 'gpt-4.1-mini')
    const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('openai')
    const [insights, setInsights] = useState<string | null>(null)
    const [tokenUsage, setTokenUsage] = useState<any>(null)
    const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
    const [insightsError, setInsightsError] = useState<string | null>(null)
    const [dataError, setDataError] = useState<string | null>(null)

    // Get raw data for selected source
    const rawData = useMemo(() => {
        if (!fetchedData) return []
        return fetchedData[selectedDataSource] || []
    }, [fetchedData, selectedDataSource])

    // Derive columns from raw data
    const columns = useMemo(() => {
        if (!rawData.length) return []

        const sample = rawData[0]
        const cols: ColumnDefinition[] = []

        Object.keys(sample).forEach(key => {
            const value = sample[key]
            let type: 'metric' | 'dimension' | 'date' = 'dimension'

            // Determine column type based on key name and value
            if (typeof value === 'number' ||
                key.match(/^(impr|clicks|cost|conv|value|cpc|ctr|convRate|cpa|roas|impressions|conversions|cvr)$/i)) {
                type = 'metric'
            } else if (key.toLowerCase().includes('date') ||
                (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/))) {
                type = 'date'
            }

            // Create user-friendly labels
            const label = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim()

            cols.push({
                name: label,
                key,
                type,
                label
            })
        })

        return cols
    }, [rawData])

    // Apply filters
    const filteredData = useMemo(() => {
        if (!rawData.length || !filters.length) return rawData

        return rawData.filter(row => {
            return filters.every(filter => {
                const value = row[filter.column]
                const filterValue = filter.value

                if (value == null) return false

                switch (filter.operator) {
                    case 'contains':
                        return String(value).toLowerCase().includes(filterValue.toLowerCase())
                    case 'not_contains':
                        return !String(value).toLowerCase().includes(filterValue.toLowerCase())
                    case 'equals':
                        return String(value) === filterValue
                    case 'not_equals':
                        return String(value) !== filterValue
                    case 'starts_with':
                        return String(value).toLowerCase().startsWith(filterValue.toLowerCase())
                    case 'ends_with':
                        return String(value).toLowerCase().endsWith(filterValue.toLowerCase())
                    case 'greater_than':
                        return Number(value) > Number(filterValue)
                    case 'less_than':
                        return Number(value) < Number(filterValue)
                    case 'greater_equal':
                        return Number(value) >= Number(filterValue)
                    case 'less_equal':
                        return Number(value) <= Number(filterValue)
                    case 'after':
                        return new Date(value) > new Date(filterValue)
                    case 'before':
                        return new Date(value) < new Date(filterValue)
                    case 'on_or_after':
                        return new Date(value) >= new Date(filterValue)
                    case 'on_or_before':
                        return new Date(value) <= new Date(filterValue)
                    default:
                        return true
                }
            })
        })
    }, [rawData, filters])

    // Apply sorting
    const sortedData = useMemo(() => {
        if (!sortConfig) return filteredData

        return [...filteredData].sort((a, b) => {
            const aVal = a[sortConfig.column]
            const bVal = b[sortConfig.column]

            if (aVal == null && bVal == null) return 0
            if (aVal == null) return 1
            if (bVal == null) return -1

            let comparison = 0
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                comparison = aVal - bVal
            } else {
                comparison = String(aVal).localeCompare(String(bVal))
            }

            return sortConfig.direction === 'desc' ? -comparison : comparison
        })
    }, [filteredData, sortConfig])

    // Get preview data
    const previewData = useMemo(() => {
        return sortedData.slice(0, previewRowCount)
    }, [sortedData, previewRowCount])

    // Calculate data summary
    const dataSummary = useMemo((): DataSummary => {
        if (!filteredData.length) {
            return { totalRows: 0, metrics: {}, dimensions: {} }
        }

        const summary: DataSummary = {
            totalRows: filteredData.length,
            metrics: {},
            dimensions: {}
        }

        columns.forEach(col => {
            if (col.type === 'metric') {
                const values = filteredData
                    .map(row => Number(row[col.key]))
                    .filter(val => !isNaN(val))

                if (values.length > 0) {
                    summary.metrics[col.key] = {
                        min: Math.min(...values),
                        max: Math.max(...values),
                        avg: values.reduce((sum, val) => sum + val, 0) / values.length,
                        sum: values.reduce((sum, val) => sum + val, 0)
                    }
                }
            } else if (col.type === 'dimension') {
                const values = filteredData.map(row => String(row[col.key])).filter(Boolean)
                const valueCount = new Map<string, number>()

                values.forEach(val => {
                    valueCount.set(val, (valueCount.get(val) || 0) + 1)
                })

                const topValues = Array.from(valueCount.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([value, count]) => ({ value, count }))

                summary.dimensions[col.key] = {
                    uniqueCount: valueCount.size,
                    topValues
                }
            }
        })

        return summary
    }, [filteredData, columns])

    // Filter management functions
    const addFilter = useCallback(() => {
        const newFilter: DataFilter = {
            id: Math.random().toString(36).substr(2, 9),
            column: columns[0]?.key || '',
            operator: 'equals',
            value: ''
        }
        setFilters(prev => [...prev, newFilter])
    }, [columns])

    const updateFilter = useCallback((id: string, updates: Partial<DataFilter>) => {
        setFilters(prev => prev.map(filter =>
            filter.id === id ? { ...filter, ...updates } : filter
        ))
    }, [])

    const removeFilter = useCallback((id: string) => {
        setFilters(prev => prev.filter(filter => filter.id !== id))
    }, [])

    // Reset filters when data source changes
    const handleDataSourceChange = useCallback((source: DataSourceType) => {
        setSelectedDataSource(source)
        setFilters([])
        setSortConfig(null)
        setInsights(null)
        setInsightsError(null)
        setTokenUsage(null)
    }, [])

    // Generate insights function
    const generateInsights = useCallback(async () => {
        if (!prompt.trim() || !filteredData.length) return

        setIsGeneratingInsights(true)
        setInsightsError(null)

        try {
            // Limit data size for API
            const dataToAnalyze = filteredData.slice(0, MAX_RECOMMENDED_INSIGHT_ROWS)

            // Build filter descriptions
            const filterDescriptions = filters.map(filter => {
                const column = columns.find(col => col.key === filter.column)
                const operator = FILTER_OPERATORS.find(op => op.value === filter.operator)
                return `${column?.label || filter.column} ${operator?.label || filter.operator} "${filter.value}"`
            })

            const response = await generateInsightsWithProvider({
                prompt,
                data: dataToAnalyze,
                dataSource: selectedDataSource,
                filters: filterDescriptions,
                totalRows: rawData.length,
                analyzedRows: dataToAnalyze.length,
                currency: '$', // Should come from settings
                provider: selectedProvider,
                model: AVAILABLE_MODELS.find(m => m.id === selectedModel)?.apiModel || selectedModel
            })

            setInsights(response.content)
            setTokenUsage(response.usage)
        } catch (error) {
            setInsightsError(error instanceof Error ? error.message : 'Failed to generate insights')
        } finally {
            setIsGeneratingInsights(false)
        }
    }, [prompt, filteredData, filters, columns, selectedDataSource, rawData.length, selectedProvider, selectedModel])

    return {
        // Data source and loading
        selectedDataSource,
        setSelectedDataSource: handleDataSourceChange,
        isDataLoading,
        dataError: contextDataError || dataError,

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
        sortedData,
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
    }
} 