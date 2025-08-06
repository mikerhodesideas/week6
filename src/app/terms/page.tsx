'use client'

import { useState, useMemo } from 'react'
import { useSettings } from '@/lib/contexts/SettingsContext'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'
import type { SearchTermMetric, TabData } from '@/lib/types'
import { calculateAllSearchTermMetrics, type CalculatedSearchTermMetric } from '@/lib/metrics'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

type SortField = keyof CalculatedSearchTermMetric
type SortDirection = 'asc' | 'desc'

export default function TermsPage() {
    const { settings, fetchedData, dataError, isDataLoading } = useSettings()
    const [sortField, setSortField] = useState<SortField>('cost')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // --- Hooks called unconditionally at the top --- 
    const searchTermsRaw = useMemo(() => (fetchedData?.searchTerms || []) as SearchTermMetric[], [fetchedData]);

    // Calculate derived metrics for all terms using useMemo
    const calculatedSearchTerms = useMemo(() => {
        return calculateAllSearchTermMetrics(searchTermsRaw)
    }, [searchTermsRaw])

    // Sort data (now using calculated terms)
    const sortedTerms = useMemo(() => {
        return [...calculatedSearchTerms].sort((a, b) => {
            const aVal = a[sortField]
            const bVal = b[sortField]
            // Handle potential string sorting for non-numeric fields if necessary
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return aVal.localeCompare(bVal) * (sortDirection === 'asc' ? 1 : -1);
            }
            return (Number(aVal) - Number(bVal)) * (sortDirection === 'asc' ? 1 : -1)
        })
    }, [calculatedSearchTerms, sortField, sortDirection])

    // Pagination calculations
    const totalPages = Math.ceil(sortedTerms.length / rowsPerPage)
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    const paginatedTerms = sortedTerms.slice(startIndex, endIndex)

    // Reset to page 1 when changing rows per page or sort
    const handleRowsPerPageChange = (value: string) => {
        setRowsPerPage(Number(value))
        setCurrentPage(1)
    }
    // --- End of unconditional hooks ---

    // Handle loading and error states *after* hooks
    if (dataError) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500 mb-4">Error loading data</div>
            </div>
        )
    }

    if (isDataLoading) {
        return <div className="p-8 text-center">Loading...</div>
    }

    const handleSort = (field: SortField) => {
        const isStringField = ['searchTerm', 'keyword', 'campaign', 'adGroup'].includes(field);
        const defaultDirection = isStringField ? 'asc' : 'desc';

        if (field === sortField) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection(defaultDirection)
        }
        setCurrentPage(1) // Reset to page 1 when sorting
    }

    const SortButton = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
        <Button
            variant="ghost"
            onClick={() => handleSort(field)}
            className="h-8 px-2 lg:px-3"
        >
            {children}
            {sortField === field && (
                <span className="ml-2">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
            )}
        </Button>
    )

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Search className="h-6 w-6" />
                    <h1 className="text-3xl font-bold">Search Terms</h1>
                </div>
                <p className="text-muted-foreground text-lg">
                    Analyze search term performance and discover new keyword opportunities
                </p>
            </div>

            {/* Table with Controls */}
            <div className="space-y-4">
                {/* Table Controls */}
                <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                        Showing {startIndex + 1}-{Math.min(endIndex, sortedTerms.length)} of {sortedTerms.length.toLocaleString()} terms
                    </div>
                    <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">Rows per page:</Label>
                        <Select value={rowsPerPage.toString()} onValueChange={handleRowsPerPageChange}>
                            <SelectTrigger className="w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="30">30</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-md border bg-white">
                    <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 border-b-2 border-gray-200">
                            <TableHead className="w-[200px] font-bold text-gray-900">
                                <SortButton field="searchTerm">Search Term</SortButton>
                            </TableHead>
                            <TableHead className="w-[180px] font-bold text-gray-900">
                                <SortButton field="keyword">Keyword Text</SortButton>
                            </TableHead>
                            <TableHead className="font-bold text-gray-900">
                                <SortButton field="campaign">Campaign</SortButton>
                            </TableHead>
                            <TableHead className="font-bold text-gray-900">
                                <SortButton field="adGroup">Ad Group</SortButton>
                            </TableHead>
                            <TableHead className="text-right font-bold text-gray-900">
                                <SortButton field="impr">Impr</SortButton>
                            </TableHead>
                            <TableHead className="text-right font-bold text-gray-900">
                                <SortButton field="clicks">Clicks</SortButton>
                            </TableHead>
                            <TableHead className="text-right font-bold text-gray-900">
                                <SortButton field="cost">Cost</SortButton>
                            </TableHead>
                            <TableHead className="text-right font-bold text-gray-900">
                                <SortButton field="conv">Conv</SortButton>
                            </TableHead>
                            <TableHead className="text-right font-bold text-gray-900">
                                <SortButton field="value">Value</SortButton>
                            </TableHead>
                            <TableHead className="text-right font-bold text-gray-900">
                                <SortButton field="CTR">CTR</SortButton>
                            </TableHead>
                            <TableHead className="text-right font-bold text-gray-900">
                                <SortButton field="CPC">CPC</SortButton>
                            </TableHead>
                            <TableHead className="text-right font-bold text-gray-900">
                                <SortButton field="CvR">CvR</SortButton>
                            </TableHead>
                            <TableHead className="text-right font-bold text-gray-900">
                                <SortButton field="CPA">CPA</SortButton>
                            </TableHead>
                            <TableHead className="text-right font-bold text-gray-900">
                                <SortButton field="ROAS">ROAS</SortButton>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedTerms.map((term, i) => (
                            <TableRow key={`${term.searchTerm}-${term.campaign}-${term.adGroup}-${i}-${term.keyword}`}>
                                <TableCell className="font-medium">{term.searchTerm}</TableCell>
                                <TableCell>{(term as any).keywordText || term.keyword || '-'}</TableCell>
                                <TableCell>{term.campaign}</TableCell>
                                <TableCell>{term.adGroup}</TableCell>
                                <TableCell className="text-right">{formatNumber(term.impr)}</TableCell>
                                <TableCell className="text-right">{formatNumber(term.clicks)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(term.cost, settings.currency)}</TableCell>
                                <TableCell className="text-right">{formatNumber(term.conv)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(term.value, settings.currency)}</TableCell>
                                <TableCell className="text-right">{formatPercent(term.CTR)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(term.CPC, settings.currency)}</TableCell>
                                <TableCell className="text-right">{formatPercent(term.CvR)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(term.CPA, settings.currency)}</TableCell>
                                <TableCell className="text-right">
                                    {(term.ROAS && isFinite(term.ROAS)) ? `${term.ROAS.toFixed(1)}x` : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 