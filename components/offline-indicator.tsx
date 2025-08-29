"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wifi, WifiOff, RefreshCw, Clock } from "lucide-react"
import { useOfflineSync } from "@/hooks/use-offline-sync"

export function OfflineIndicator() {
  const { isOnline, pendingSync, triggerSync } = useOfflineSync()

  const totalPending = pendingSync.tasks + pendingSync.assets + pendingSync.bookings

  if (isOnline && totalPending === 0) {
    return null
  }

  return (
    <Card className="border-l-4 border-l-warning">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 text-success" />
              Online
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-warning" />
              Offline Mode
            </>
          )}
        </CardTitle>
        <CardDescription className="text-xs">
          {isOnline
            ? totalPending > 0
              ? "Some changes are waiting to sync"
              : "All changes synced"
            : "Changes will sync when you're back online"}
        </CardDescription>
      </CardHeader>
      {totalPending > 0 && (
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-3 h-3" />
              <span>Pending sync:</span>
              <div className="flex gap-1">
                {pendingSync.tasks > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {pendingSync.tasks} tasks
                  </Badge>
                )}
                {pendingSync.assets > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {pendingSync.assets} assets
                  </Badge>
                )}
                {pendingSync.bookings > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {pendingSync.bookings} bookings
                  </Badge>
                )}
              </div>
            </div>
            {isOnline && (
              <Button size="sm" variant="outline" onClick={triggerSync} className="h-7 text-xs bg-transparent">
                <RefreshCw className="w-3 h-3 mr-1" />
                Sync Now
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
