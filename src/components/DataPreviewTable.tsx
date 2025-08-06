// src/components/DataPreviewTable.tsx
'use client'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { ColumnDefinition, SortConfig } from '@/lib/types'
import { PREVIEW_ROW_OPTIONS } from '@/lib/config'

interface DataPreviewTableProps {
  data: any[]
  columns: ColumnDefinition[]
  sortConfig: SortConfig | null
  onSort: (config: SortConfig | null) => void
  previewRowCount: number
  onPreviewRowCountChange: (count: number) => void
  totalRows: number
}

export function DataPreviewTable({
  data,
  columns,
  sortConfig,
  onSort,
  previewRowCount,
  onPreviewRowCountChange,
  totalRows
}: DataPreviewTableProps) {
  // Filter out unwanted columns
  const filteredColumns = columns.filter(column => 
    column.key !== 'keyword' // Hide the 'keyword' column specifically
  )
  const handleSort = (columnKey: string) => {
    if (sortConfig?.column === columnKey) {
      if (sortConfig.direction === 'asc') {
        onSort({ column: columnKey, direction: 'desc' })
      } else {
        onSort(null) // Reset sorting
      }
    } else {
      onSort({ column: columnKey, direction: 'asc' })
    }
  }

  const getSortIcon = (columnKey: string) => {
    if (sortConfig?.column !== columnKey) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />
  }

  const formatValue = (value: any, column: ColumnDefinition) => {
    if (value == null) return '-'
    
    if (column.type === 'metric') {
      if (typeof value === 'number') {
        // Format based on column name
        if (column.key.toLowerCase().includes('cost') || 
            column.key.toLowerCase().includes('value') ||
            column.key.toLowerCase() === 'cpc' ||
            column.key.toLowerCase() === 'cpa') {
          return `$${value.toFixed(2)}`
        }
        if (column.key.toLowerCase() === 'ctr' || 
            column.key.toLowerCase() === 'convrate' ||
            column.key.toLowerCase() === 'cvr') {
          return `${(value * 100).toFixed(2)}%`
        }
        if (column.key.toLowerCase() === 'roas') {
          return value.toFixed(2)
        }
        // Default number formatting
        return value.toLocaleString()
      }
    }
    
    return String(value)
  }

  return (
    <Card className="bg-green-50/50 border-green-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Data Preview</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows:</span>
            <Select 
              value={previewRowCount.toString()} 
              onValueChange={(value) => onPreviewRowCountChange(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PREVIEW_ROW_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {data.length} of {totalRows} total rows
          {sortConfig && (
            <span className="ml-2">
              • Sorted by {filteredColumns.find(col => col.key === sortConfig.column)?.label} 
              ({sortConfig.direction === 'asc' ? 'ascending' : 'descending'})
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No data matches your current filters.
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {filteredColumns.map((column) => (
                    <TableHead key={column.key} className="font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort(column.key)}
                      >
                        <span className="mr-2">{column.label}</span>
                        {getSortIcon(column.key)}
                      </Button>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow key={index}>
                    {filteredColumns.map((column) => (
                      <TableCell key={column.key} className="font-mono text-sm">
                        {formatValue(row[column.key], column)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 