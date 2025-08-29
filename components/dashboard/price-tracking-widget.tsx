"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DollarSign, TrendingDown, Bell, Target, Search, ExternalLink } from "lucide-react"
import Link from "next/link"

interface PriceTrackingWidgetProps {
  priceAlerts: any[]
  savings: any[]
}

export function PriceTrackingWidget({ priceAlerts, savings }: PriceTrackingWidgetProps) {
  const activePriceAlerts = priceAlerts.filter((alert) => alert.is_active)
  const triggeredAlerts = priceAlerts.filter((alert) => alert.current_price <= alert.target_price)

  const monthlySpending = savings.reduce((sum, saving) => sum + (saving.amount_saved || 0), 0)
  const totalSavings = savings.reduce((sum, saving) => sum + saving.amount_saved, 0)
  const avgSavingsPerPurchase = savings.length > 0 ? totalSavings / savings.length : 0

  const recentSavings = savings.slice(0, 3)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Price Tracking
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              ${totalSavings.toFixed(0)} Saved
            </Badge>
            <Link href="/price-compare">
              <Button size="sm" variant="outline">
                <Search className="w-4 h-4 mr-1" />
                Compare Prices
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Savings Overview */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-green-50 rounded">
            <p className="text-lg font-bold text-green-700">${totalSavings.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Total Saved</p>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <p className="text-lg font-bold">{activePriceAlerts.length}</p>
            <p className="text-xs text-muted-foreground">Active Alerts</p>
          </div>
          <div className="p-2 bg-blue-50 rounded">
            <p className="text-lg font-bold text-blue-700">${avgSavingsPerPurchase.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Avg Savings</p>
          </div>
        </div>

        {/* Price Alerts */}
        {triggeredAlerts.length > 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-700 text-sm">
                {triggeredAlerts.length} Price Drop{triggeredAlerts.length > 1 ? "s" : ""} Alert!
              </span>
            </div>
            <div className="space-y-2">
              {triggeredAlerts.slice(0, 2).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between gap-2 p-2 bg-white rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{alert.product_name}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Target: ${alert.target_price}</span>
                      <TrendingDown className="w-3 h-3 text-green-600" />
                      <span className="text-green-600 font-medium">Now: ${alert.current_price}</span>
                    </div>
                  </div>
                  <Link href={`/price-compare/${alert.product_id}`}>
                    <Button size="sm" className="h-6 px-2">
                      Buy Now
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Price Alerts */}
        {activePriceAlerts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4" />
                Watching Prices ({activePriceAlerts.length})
              </h4>
              <Link href="/price-compare/alerts">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {activePriceAlerts.slice(0, 3).map((alert) => {
                const progress = Math.min(
                  100,
                  ((alert.original_price - alert.current_price) / (alert.original_price - alert.target_price)) * 100,
                )
                const isClose = alert.current_price <= alert.target_price * 1.1

                return (
                  <div key={alert.id} className="p-2 bg-muted/50 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate flex-1">{alert.product_name}</p>
                      <Badge
                        variant="outline"
                        className={`text-xs ${isClose ? "bg-yellow-50 text-yellow-700 border-yellow-200" : ""}`}
                      >
                        ${alert.current_price}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Target: ${alert.target_price}</span>
                      <Progress value={progress} className="h-1 flex-1" />
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent Savings */}
        {recentSavings.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-green-600" />
              <h4 className="text-sm font-medium">Recent Savings</h4>
            </div>
            <div className="space-y-2">
              {recentSavings.map((saving) => (
                <div key={saving.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{saving.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Saved ${saving.amount_saved} • {new Date(saving.purchase_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    ${saving.amount_saved}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {priceAlerts.length === 0 && savings.length === 0 && (
          <div className="text-center py-6">
            <DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">No price tracking yet</p>
            <Link href="/price-compare">
              <Button size="sm">
                <Search className="w-4 h-4 mr-1" />
                Start Comparing Prices
              </Button>
            </Link>
          </div>
        )}

        {(priceAlerts.length > 0 || savings.length > 0) && (
          <div className="pt-2 border-t">
            <Link href="/price-compare/savings">
              <Button variant="ghost" size="sm" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Savings Dashboard
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
