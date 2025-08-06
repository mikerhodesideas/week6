// src/components/DataFilters.tsx
'use client'
import { X, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { ColumnDefinition, DataFilter, FILTER_OPERATORS } from '@/lib/types'

interface DataFiltersProps {
  filters: DataFilter[]
  columns: ColumnDefinition[]
  onAddFilter: () => void
  onUpdateFilter: (id: string, updates: Partial<DataFilter>) => void
  onRemoveFilter: (id: string) => void
}

export function DataFilters({
  filters,
  columns,
  onAddFilter,
  onUpdateFilter,
  onRemoveFilter
}: DataFiltersProps) {
  const getOperatorsForColumn = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey)
    if (!column) return []
    
    return FILTER_OPERATORS.filter(op => op.types.includes(column.type))
  }

  const getDefaultOperator = (columnKey: string) => {
    const operators = getOperatorsForColumn(columnKey)
    return operators[0]?.value || 'equals'
  }

  const handleColumnChange = (filterId: string, columnKey: string) => {
    const defaultOperator = getDefaultOperator(columnKey)
    onUpdateFilter(filterId, {
      column: columnKey,
      operator: defaultOperator,
      value: ''
    })
  }

  const getInputType = (columnKey: string, operator: string) => {
    const column = columns.find(col => col.key === columnKey)
    if (!column) return 'text'
    
    if (column.type === 'metric') return 'number'
    if (column.type === 'date') return 'date'
    return 'text'
  }

  return (
    <Card className="bg-blue-50/50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          <Button onClick={onAddFilter} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Filter
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {filters.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No filters applied. Click "Add Filter" to filter your data.
          </p>
        ) : (
          filters.map((filter) => (
            <div key={filter.id} className="flex items-end gap-3 p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                <Label>Column</Label>
                <Select
                  value={filter.column}
                  onValueChange={(value) => handleColumnChange(filter.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((column) => (
                      <SelectItem key={column.key} value={column.key}>
                        {column.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 space-y-2">
                <Label>Operator</Label>
                <Select
                  value={filter.operator}
                  onValueChange={(value) => onUpdateFilter(filter.id, { operator: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {getOperatorsForColumn(filter.column).map((operator) => (
                      <SelectItem key={operator.value} value={operator.value}>
                        {operator.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 space-y-2">
                <Label>Value</Label>
                <Input
                  type={getInputType(filter.column, filter.operator)}
                  value={filter.value}
                  onChange={(e) => onUpdateFilter(filter.id, { value: e.target.value })}
                  placeholder="Enter value"
                />
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onRemoveFilter(filter.id)}
                className="h-9 w-9 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
        
        {filters.length > 0 && (
          <div className="text-xs text-muted-foreground pt-2 border-t">
            All filters are combined using AND logic. 
            {filters.length} filter{filters.length === 1 ? '' : 's'} applied.
          </div>
        )}
      </CardContent>
    </Card>
  )
} 