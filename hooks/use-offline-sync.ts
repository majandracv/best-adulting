"use client"

import { useState, useEffect } from "react"
import { offlineStorage } from "@/lib/offline-storage"

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingSync, setPendingSync] = useState({
    tasks: 0,
    assets: 0,
    bookings: 0,
  })

  useEffect(() => {
    // Initialize offline storage
    offlineStorage.initialize()

    // Set up online/offline listeners
    const handleOnline = () => {
      setIsOnline(true)
      console.log("[OfflineSync] Back online - triggering sync")
      triggerSync()
    }

    const handleOffline = () => {
      setIsOnline(false)
      console.log("[OfflineSync] Gone offline")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check initial online status
    setIsOnline(navigator.onLine)

    // Update pending sync counts
    updatePendingCounts()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const updatePendingCounts = async () => {
    try {
      const [tasks, assets, bookings] = await Promise.all([
        offlineStorage.getPendingSync("task"),
        offlineStorage.getPendingSync("asset"),
        offlineStorage.getPendingSync("booking"),
      ])

      setPendingSync({
        tasks: tasks.length,
        assets: assets.length,
        bookings: bookings.length,
      })
    } catch (error) {
      console.error("[OfflineSync] Failed to update pending counts:", error)
    }
  }

  const triggerSync = async () => {
    try {
      await Promise.all([
        offlineStorage.requestBackgroundSync("sync-tasks"),
        offlineStorage.requestBackgroundSync("sync-assets"),
        offlineStorage.requestBackgroundSync("sync-bookings"),
      ])

      // Update counts after sync
      setTimeout(updatePendingCounts, 1000)
    } catch (error) {
      console.error("[OfflineSync] Failed to trigger sync:", error)
    }
  }

  const storeForOfflineSync = async (type: "task" | "asset" | "booking", data: any) => {
    try {
      await offlineStorage.storeForSync(type, data)
      await updatePendingCounts()

      if (isOnline) {
        await offlineStorage.requestBackgroundSync(`sync-${type}s`)
      }
    } catch (error) {
      console.error(`[OfflineSync] Failed to store ${type} for sync:`, error)
      throw error
    }
  }

  const getCachedData = async (key: string) => {
    try {
      return await offlineStorage.getCachedData(key)
    } catch (error) {
      console.error("[OfflineSync] Failed to get cached data:", error)
      return null
    }
  }

  const cacheData = async (key: string, data: any, ttl?: number) => {
    try {
      await offlineStorage.cacheData(key, data, ttl)
    } catch (error) {
      console.error("[OfflineSync] Failed to cache data:", error)
    }
  }

  return {
    isOnline,
    pendingSync,
    storeForOfflineSync,
    getCachedData,
    cacheData,
    triggerSync,
    updatePendingCounts,
  }
}
