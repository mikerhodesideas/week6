// src/components/DataSummary.tsx
'use client'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ColumnDefinition, DataSummary as DataSummaryType } from '@/lib/types'

interface DataSummaryProps {
    summary: DataSummaryType
    columns: ColumnDefinition[]
}

export function DataSummary({ summary, columns }: DataSummaryProps) {
    const formatMetricValue = (value: number, columnKey: string) => {
        if (columnKey.toLowerCase().includes('cost') ||
            columnKey.toLowerCase().includes('value') ||
            columnKey.toLowerCase() === 'cpc' ||
            columnKey.toLowerCase() === 'cpa') {
            return `$${value.toFixed(2)}`
        }
        if (columnKey.toLowerCase() === 'ctr' ||
            columnKey.toLowerCase() === 'convrate' ||
            columnKey.toLowerCase() === 'cvr') {
            return `${(value * 100).toFixed(2)}%`
        }
        if (columnKey.toLowerCase() === 'roas') {
            return value.toFixed(2)
        }
        return value.toLocaleString()
    }

    const metricColumns = columns.filter(col => col.type === 'metric')
    const dimensionColumns = columns.filter(col => col.type === 'dimension')

    if (summary.totalRows === 0) {
        return (
            <Card className="bg-amber-50/50 border-amber-200">
                <CardHeader>
                    <CardTitle>Data Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                        No data to summarize
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-amber-50/50 border-amber-200">
            <CardHeader>
                <CardTitle>Data Summary</CardTitle>
                <div className="text-sm text-muted-foreground">
                    Statistical overview of {summary.totalRows.toLocaleString()} rows
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Row Count */}
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{summary.totalRows.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Rows</div>
                </div>

                {/* Metrics Summary */}
                {metricColumns.length > 0 && (
                    <div>
                        <h4 className="font-medium mb-3">Metrics</h4>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {metricColumns.map((column) => {
                                const metricData = summary.metrics[column.key]
                                if (!metricData) return null

                                return (
                                    <div key={column.key} className="border rounded-lg p-3">
                                        <div className="font-medium mb-2">{column.label}</div>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Min:</span>
                                                <span className="font-mono">{formatMetricValue(metricData.min, column.key)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Max:</span>
                                                <span className="font-mono">{formatMetricValue(metricData.max, column.key)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Avg:</span>
                                                <span className="font-mono">{formatMetricValue(metricData.avg, column.key)}</span>
                                            </div>
                                            <div className="flex justify-between border-t pt-1">
                                                <span className="text-muted-foreground">Sum:</span>
                                                <span className="font-mono font-medium">{formatMetricValue(metricData.sum, column.key)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Dimensions Summary */}
                {dimensionColumns.length > 0 && (
                    <div>
                        <h4 className="font-medium mb-3">Dimensions</h4>
                        <div className="grid gap-4 md:grid-cols-2">
                            {dimensionColumns.map((column) => {
                                const dimensionData = summary.dimensions[column.key]
                                if (!dimensionData) return null

                                return (
                                    <div key={column.key} className="border rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium">{column.label}</span>
                                            <Badge variant="secondary">
                                                {dimensionData.uniqueCount} unique
                                            </Badge>
                                        </div>

                                        {dimensionData.topValues && dimensionData.topValues.length > 0 && (
                                            <div className="space-y-1">
                                                <div className="text-xs text-muted-foreground mb-1">Top values:</div>
                                                {dimensionData.topValues.map((item, index) => (
                                                    <div key={index} className="flex justify-between text-sm">
                                                        <span className="truncate flex-1 mr-2" title={item.value}>
                                                            {item.value}
                                                        </span>
                                                        <span className="text-muted-foreground font-mono">
                                                            {item.count}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 