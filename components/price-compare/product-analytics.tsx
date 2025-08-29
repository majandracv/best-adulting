"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Calendar, Target, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PricePoint {
  date: string
  price: number
  retailer: string
}

interface ProductAnalyticsProps {
  product: {
    id: number
    name: string
    category: string
    currentPrices: Array<{
      retailer: string
      price: number
      originalPrice: number
      savings: number
    }>
    priceHistory: PricePoint[]
    avgPrice: number
    lowestPrice: number
    highestPrice: number
    priceVolatility: "low" | "medium" | "high"
    recommendation: "buy_now" | "wait" | "price_dropping"
  }
}

export function ProductAnalytics({ product }: ProductAnalyticsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d")

  const currentBestPrice = Math.min(...product.currentPrices.map((p) => p.price))
  const potentialSavings = product.avgPrice - currentBestPrice
  const priceChange =
    product.priceHistory.length > 1
      ? product.priceHistory[product.priceHistory.length - 1].price - product.priceHistory[0].price
      : 0

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "buy_now":
        return "bg-accent text-accent-foreground"
      case "wait":
        return "bg-destructive text-destructive-foreground"
      case "price_dropping":
        return "bg-primary text-primary-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getRecommendationText = (rec: string) => {
    switch (rec) {
      case "buy_now":
        return "Buy Now - Great Price!"
      case "wait":
        return "Wait - Price May Drop"
      case "price_dropping":
        return "Price Dropping - Monitor"
      default:
        return "Monitor Price"
    }
  }

  return (
    <div className="space-y-6">
      {/* Price Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">Best Price</span>
            </div>
            <div className="text-2xl font-bold">${currentBestPrice}</div>
            <div className="text-sm text-muted-foreground">Save ${potentialSavings.toFixed(2)} vs avg</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {priceChange < 0 ? (
                <TrendingDown className="h-4 w-4 text-accent" />
              ) : (
                <TrendingUp className="h-4 w-4 text-destructive" />
              )}
              <span className="text-sm font-medium">30-Day Trend</span>
            </div>
            <div className={`text-2xl font-bold ${priceChange < 0 ? "text-accent" : "text-destructive"}`}>
              {priceChange < 0 ? "-" : "+"}${Math.abs(priceChange).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              {priceChange < 0 ? "Price decreased" : "Price increased"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Volatility</span>
            </div>
            <Badge variant={product.priceVolatility === "low" ? "default" : "destructive"}>
              {product.priceVolatility.toUpperCase()}
            </Badge>
            <div className="text-sm text-muted-foreground mt-1">Price stability</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Recommendation</span>
            </div>
            <Badge className={getRecommendationColor(product.recommendation)}>
              {getRecommendationText(product.recommendation)}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comparison">Price Comparison</TabsTrigger>
          <TabsTrigger value="history">Price History</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Retailer Prices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {product.currentPrices
                  .sort((a, b) => a.price - b.price)
                  .map((price, index) => (
                    <div
                      key={price.retailer}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        index === 0 ? "border-accent bg-accent/5" : "border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${index === 0 ? "bg-accent" : "bg-muted-foreground"}`} />
                        <span className="font-medium">{price.retailer}</span>
                        {index === 0 && <Badge className="bg-accent text-accent-foreground">Best</Badge>}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">${price.price}</div>
                        {price.savings > 0 && (
                          <div className="text-sm text-accent">
                            Save ${price.savings} ({((price.savings / price.originalPrice) * 100).toFixed(0)}%)
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Price History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  {["7d", "30d", "90d", "1y"].map((timeframe) => (
                    <Button
                      key={timeframe}
                      variant={selectedTimeframe === timeframe ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTimeframe(timeframe)}
                    >
                      {timeframe}
                    </Button>
                  ))}
                </div>

                {/* Simple price history visualization */}
                <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Price chart visualization</p>
                    <p className="text-sm text-muted-foreground">
                      Lowest: ${product.lowestPrice} | Highest: ${product.highestPrice}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Average Price:</span>
                    <span className="ml-2 font-medium">${product.avgPrice}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Price Range:</span>
                    <span className="ml-2 font-medium">
                      ${product.lowestPrice} - ${product.highestPrice}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Smart Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <div className="font-medium">Price Drop Alert</div>
                    <div className="text-sm text-muted-foreground">
                      This product's price has dropped 15% in the last 30 days. This could be a good time to buy.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Seasonal Pattern</div>
                    <div className="text-sm text-muted-foreground">
                      Similar products typically see price drops in Q4. Consider waiting if not urgent.
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Target className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">Price Target</div>
                    <div className="text-sm text-muted-foreground">
                      Set a price alert for ${(currentBestPrice * 0.9).toFixed(2)} to get notified of better deals.
                    </div>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-transparent" variant="outline">
                Set Price Alert
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
