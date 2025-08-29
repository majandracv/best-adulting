"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Camera, AlertTriangle, CheckCircle, Clock, ExternalLink, Plus, Wrench } from "lucide-react"
import Link from "next/link"

interface IntegratedAssetWidgetProps {
  assets: any[]
  tasks: any[]
}

export function IntegratedAssetWidget({ assets, tasks }: IntegratedAssetWidgetProps) {
  // Calculate asset maintenance status
  const assetMaintenanceStatus = assets.map((asset) => {
    const assetTasks = tasks.filter((task) => task.asset_id === asset.id)
    const overdueTasks = assetTasks.filter((task) => {
      if (!task.due_date || task.status === "completed") return false
      return new Date(task.due_date) < new Date()
    })
    const upcomingTasks = assetTasks.filter((task) => {
      if (!task.due_date || task.status === "completed") return false
      const dueDate = new Date(task.due_date)
      const today = new Date()
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays >= 0 && diffDays <= 30
    })

    return {
      ...asset,
      overdueTasks: overdueTasks.length,
      upcomingTasks: upcomingTasks.length,
      totalTasks: assetTasks.length,
      status: overdueTasks.length > 0 ? "needs-attention" : upcomingTasks.length > 0 ? "upcoming-maintenance" : "good",
    }
  })

  const needsAttention = assetMaintenanceStatus.filter((asset) => asset.status === "needs-attention")
  const upcomingMaintenance = assetMaintenanceStatus.filter((asset) => asset.status === "upcoming-maintenance")
  const totalValue = assets.reduce((sum, asset) => sum + (asset.purchase_price || 0), 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            Asset Management
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              ${totalValue.toLocaleString()} Total Value
            </Badge>
            <Link href="/assets/new/camera">
              <Button size="sm" variant="outline">
                <Camera className="w-4 h-4 mr-1" />
                Scan Asset
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Asset Status Overview */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-muted/50 rounded">
            <p className="text-lg font-bold">{assets.length}</p>
            <p className="text-xs text-muted-foreground">Total Assets</p>
          </div>
          <div className="p-2 bg-destructive/10 rounded">
            <p className="text-lg font-bold text-destructive">{needsAttention.length}</p>
            <p className="text-xs text-muted-foreground">Need Attention</p>
          </div>
          <div className="p-2 bg-accent/10 rounded">
            <p className="text-lg font-bold text-accent">{upcomingMaintenance.length}</p>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </div>
        </div>

        {/* Assets Needing Attention */}
        {needsAttention.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h4 className="text-sm font-medium text-destructive">Needs Attention ({needsAttention.length})</h4>
            </div>
            <div className="space-y-2">
              {needsAttention.slice(0, 3).map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-2 p-2 bg-destructive/5 border border-destructive/20 rounded"
                >
                  <Package className="w-4 h-4 text-destructive" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {asset.overdueTasks} overdue task{asset.overdueTasks > 1 ? "s" : ""}
                    </p>
                  </div>
                  <Link href={`/assets/${asset.id}`}>
                    <Button size="sm" variant="destructive" className="h-6 px-2">
                      <Wrench className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Assets with Maintenance Info */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Package className="w-4 h-4" />
              Recent Assets ({assets.length})
            </h4>
            <Link href="/assets">
              <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                <ExternalLink className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {assetMaintenanceStatus.slice(0, 4).map((asset) => (
              <div key={asset.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                <Package className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {asset.brand} {asset.model}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {asset.status === "good" && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="w-2 h-2 mr-1" />
                      Good
                    </Badge>
                  )}
                  {asset.status === "upcoming-maintenance" && (
                    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                      <Clock className="w-2 h-2 mr-1" />
                      Soon
                    </Badge>
                  )}
                  {asset.status === "needs-attention" && (
                    <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                      <AlertTriangle className="w-2 h-2 mr-1" />
                      Alert
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {assets.length === 0 && (
          <div className="text-center py-6">
            <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">No assets yet</p>
            <div className="flex gap-2 justify-center">
              <Link href="/assets/new/camera">
                <Button size="sm">
                  <Camera className="w-4 h-4 mr-1" />
                  Scan Asset
                </Button>
              </Link>
              <Link href="/assets/new">
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Manually
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
