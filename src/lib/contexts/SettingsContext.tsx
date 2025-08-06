// src/lib/contexts/SettingsContext.tsx
'use client'
import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import useSWR, { mutate } from 'swr'
import type { Campaign, Settings, TabData } from '../types'
import { DEFAULT_SHEET_URL } from '../config'
import { fetchAllTabsData, getCampaigns } from '../sheetsData'

export type SettingsContextType = {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
  setSheetUrl: (url: string) => void
  setCurrency: (currency: string) => void
  setSelectedCampaign: (campaignId: string) => void
  fetchedData: TabData | undefined
  dataError: any
  isDataLoading: boolean
  refreshData: () => void
  campaigns: Campaign[]
}

const defaultSettings: Settings = {
  sheetUrl: DEFAULT_SHEET_URL,
  currency: '$',
  selectedCampaign: undefined,
  activeTab: 'daily'
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('settings')
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved)
        delete parsedSettings.campaigns // Ensure campaigns are not loaded
        setSettings({ ...defaultSettings, ...parsedSettings })
      } catch {
        setSettings(defaultSettings)
      }
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    const { campaigns, ...settingsToSave } = settings as any // Exclude campaigns if present
    localStorage.setItem('settings', JSON.stringify(settingsToSave))
  }, [settings])

  // Fetch data using useSWR based on sheetUrl with smart caching
  const { data: fetchedData, error: dataError, isLoading: isDataLoading, mutate: refreshData } = useSWR<TabData>(
    settings.sheetUrl ? settings.sheetUrl : null,
    fetchAllTabsData,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute - prevent duplicate requests
      refreshInterval: 0, // Disable automatic refresh
      errorRetryCount: 2, // Retry twice on error
      loadingTimeout: 30000, // 30 second timeout
      onSuccess: (data) => {
        // Cache the data in sessionStorage only if it has actual data
        if (data && (data.daily?.length > 0 || data.searchTerms?.length > 0 || 
                     data.adGroups?.length > 0 || data.assetGroups?.length > 0)) {
          try {
            sessionStorage.setItem(`sheet-data-${settings.sheetUrl}`, JSON.stringify(data))
            sessionStorage.setItem(`sheet-data-timestamp-${settings.sheetUrl}`, Date.now().toString())
            console.log('Cached data to sessionStorage:', data)
          } catch (error) {
            console.warn('Failed to cache data in sessionStorage:', error)
          }
        }
      },
      onError: (error) => {
        // Clear bad cached data on error
        try {
          sessionStorage.removeItem(`sheet-data-${settings.sheetUrl}`)
          sessionStorage.removeItem(`sheet-data-timestamp-${settings.sheetUrl}`)
        } catch (e) {
          console.warn('Failed to clear cached data:', e)
        }
      }
    }
  )

  // Calculate campaigns based on fetchedData
  const campaigns = useMemo(() => {
    // Ensure getCampaigns is robust and filters out campaigns with empty IDs if that's a concern.
    // Assuming getCampaigns itself (from sheetsData.ts) handles or should handle data integrity.
    // If getCampaigns might return campaigns with id === '', filter them here:
    const rawCampaigns = fetchedData?.daily ? getCampaigns(fetchedData.daily) : [];
    return rawCampaigns.filter(campaign => campaign.id !== '');
  }, [fetchedData])

  const setSheetUrl = (url: string) => {
    setSettings(prev => ({ ...prev, sheetUrl: url }))
  }

  const setCurrency = (currency: string) => {
    setSettings(prev => ({ ...prev, currency }))
  }

  const setSelectedCampaign = (id: string) => {
    setSettings(prev => ({ ...prev, selectedCampaign: id }))
  }

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      setSheetUrl,
      setCurrency,
      setSelectedCampaign,
      fetchedData,
      dataError,
      isDataLoading,
      refreshData: () => refreshData(),
      campaigns
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
} 