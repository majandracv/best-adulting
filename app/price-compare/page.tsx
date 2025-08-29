"use client"

import type React from "react"

import { useState } from "react"
import { Search, Filter, TrendingUp, DollarSign, BarChart3, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProductSearch } from "@/hooks/use-product-search"
import Link from "next/link"

const categories = [
  "All Categories",
  "Appliances",
  "Home & Garden",
  "Tools & Hardware",
  "Cleaning Supplies",
  "Kitchen & Dining",
  "Bathroom",
  "Electronics",
]

export default function PriceComparePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const { products, loading, error, search, refetch } = useProductSearch()

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    const filters = {
      category: selectedCategory === "All Categories" ? undefined : selectedCategory,
      sortBy: "price_low" as const,
    }

    await search(searchQuery, filters)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Find the Best Deals on Household Items</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Compare prices across top retailers and save money on everything you need for your home
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for products (e.g., vacuum cleaner, coffee maker...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-12 pr-4 py-6 text-lg bg-background border-border focus:ring-ring"
                />
              </div>
              <Button onClick={handleSearch} disabled={loading} size="lg" className="px-8">
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Search"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
          <Filter className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <div className="flex gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive">Error: {error}</p>
            <Button variant="outline" size="sm" onClick={refetch} className="mt-2 bg-transparent">
              Try Again
            </Button>
          </div>
        )}

        {searchQuery && !loading && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-muted-foreground">
              Found {products.length} results for "{searchQuery}"
            </p>
            <Button variant="ghost" size="sm" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Prices
            </Button>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-muted rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-12 bg-muted rounded" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {products
              .reduce((acc, product) => {
                const existingGroup = acc.find((group) => group.name === product.name)
                if (existingGroup) {
                  existingGroup.prices.push({
                    retailer: product.retailer,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    savings: product.savings || 0,
                    availability: product.availability,
                    url: product.url,
                  })
                } else {
                  acc.push({
                    id: product.id,
                    name: product.name,
                    image: product.image,
                    prices: [
                      {
                        retailer: product.retailer,
                        price: product.price,
                        originalPrice: product.originalPrice,
                        savings: product.savings || 0,
                        availability: product.availability,
                        url: product.url,
                      },
                    ],
                    bestPrice: product.price,
                    avgSavings: product.savings || 0,
                  })
                }
                return acc
              }, [] as any[])
              .map((productGroup) => {
                const bestPrice = Math.min(...productGroup.prices.map((p: any) => p.price))
                const avgSavings = Math.round(
                  productGroup.prices.reduce((sum: number, p: any) => sum + p.savings, 0) / productGroup.prices.length,
                )

                return (
                  <Card key={productGroup.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-4">
                        <img
                          src={productGroup.image || "/placeholder.svg"}
                          alt={productGroup.name}
                          className="w-20 h-20 object-cover rounded-lg bg-muted"
                        />
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{productGroup.name}</CardTitle>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-accent" />
                            <span className="text-sm text-accent font-medium">Avg. savings: ${avgSavings}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {productGroup.prices
                          .sort((a: any, b: any) => a.price - b.price)
                          .map((price: any, index: number) => (
                            <div
                              key={price.retailer}
                              className={`flex items-center justify-between p-3 rounded-lg ${
                                price.price === bestPrice ? "bg-accent/10 border border-accent/20" : "bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-medium">{price.retailer}</span>
                                {price.price === bestPrice && (
                                  <Badge className="bg-accent text-accent-foreground">Best Price</Badge>
                                )}
                                {price.availability === "limited" && (
                                  <Badge variant="outline" className="text-xs">
                                    Limited Stock
                                  </Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-2">
                                  <DollarSign className="h-4 w-4" />
                                  <span className="text-lg font-bold">${price.price}</span>
                                </div>
                                {price.savings > 0 && <div className="text-sm text-accent">Save ${price.savings}</div>}
                              </div>
                            </div>
                          ))}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button className="flex-1" size="lg" asChild>
                          <a href={productGroup.prices[0].url} target="_blank" rel="noopener noreferrer">
                            View Best Deal
                          </a>
                        </Button>
                        <Link href={`/price-compare/${productGroup.id}`}>
                          <Button variant="outline" size="lg">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        )}

        {!loading && products.length === 0 && searchQuery && !error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No products found for "{searchQuery}". Try a different search term.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
