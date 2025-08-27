"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ExternalLink, TrendingUp, Loader2 } from "lucide-react"
import { UpgradeDialog } from "@/components/upgrade-dialog"
import { checkPriceComparisonLimit } from "@/lib/tier-management"

interface PriceComparisonSearchProps {
  userTier: "free" | "pro"
  locale: string
}

export function PriceComparisonSearch({ userTier, locale }: PriceComparisonSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [searchCount, setSearchCount] = useState(0)
  const t = useTranslations("shop")

  const maxOffers = userTier === "free" ? 2 : 6

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    if (!checkPriceComparisonLimit(searchCount, userTier)) {
      setShowUpgradeDialog(true)
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call for price comparison
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock results
      const mockResults = [
        {
          id: 1,
          name: searchQuery,
          vendor: "Amazon",
          price: 89.99,
          originalPrice: 129.99,
          rating: 4.5,
          reviews: 1234,
          url: "https://amazon.com",
          image: "/diverse-products-still-life.png",
        },
        {
          id: 2,
          name: searchQuery,
          vendor: "Best Buy",
          price: 94.99,
          originalPrice: 119.99,
          rating: 4.3,
          reviews: 567,
          url: "https://bestbuy.com",
          image: "/diverse-products-still-life.png",
        },
        {
          id: 3,
          name: searchQuery,
          vendor: "Target",
          price: 87.99,
          originalPrice: 109.99,
          rating: 4.4,
          reviews: 890,
          url: "https://target.com",
          image: "/diverse-products-still-life.png",
        },
        {
          id: 4,
          name: searchQuery,
          vendor: "Walmart",
          price: 82.99,
          originalPrice: 99.99,
          rating: 4.2,
          reviews: 445,
          url: "https://walmart.com",
          image: "/diverse-products-still-life.png",
        },
        {
          id: 5,
          name: searchQuery,
          vendor: "Home Depot",
          price: 91.99,
          originalPrice: 124.99,
          rating: 4.6,
          reviews: 223,
          url: "https://homedepot.com",
          image: "/diverse-products-still-life.png",
        },
        {
          id: 6,
          name: searchQuery,
          vendor: "Lowe's",
          price: 88.99,
          originalPrice: 114.99,
          rating: 4.4,
          reviews: 334,
          url: "https://lowes.com",
          image: "/diverse-products-still-life.png",
        },
      ]

      setResults(mockResults.slice(0, maxOffers))
      setSearchCount(searchCount + 1)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateSavings = (price: number, originalPrice: number) => {
    return (((originalPrice - price) / originalPrice) * 100).toFixed(0)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < rating ? "text-yellow-400" : "text-gray-300"}`}>
        ★
      </span>
    ))
  }

  return (
    <>
      <div className="space-y-6">
        {/* Search Header */}
        <Card className="border-indigo/10">
          <CardHeader>
            <CardTitle className="text-indigo">{t("title")}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo/10 text-indigo border-indigo/20">
                {userTier === "free" ? t("freeLimit") : t("proFeature")}
              </Badge>
              <span className="text-sm text-indigo/60">
                {searchCount}/{userTier === "free" ? "∞" : "∞"} searches used
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder={t("search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="border-indigo/20"
              />
              <Button
                onClick={handleSearch}
                disabled={isLoading || !searchQuery.trim()}
                className="bg-indigo hover:bg-indigo/90 text-white"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-indigo">Price Comparison Results ({results.length} offers)</h2>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                Best deal: ${Math.min(...results.map((r) => r.price)).toFixed(2)}
              </div>
            </div>

            <div className="grid gap-4">
              {results.map((result, index) => (
                <Card key={result.id} className={`border-indigo/10 ${index === 0 ? "ring-2 ring-green-200" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={result.image || "/placeholder.svg"}
                        alt={result.name}
                        className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-indigo truncate">{result.name}</h3>
                            <p className="text-sm text-indigo/60">{result.vendor}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">{renderStars(result.rating)}</div>
                              <span className="text-sm text-indigo/60">({result.reviews})</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-indigo">${result.price}</span>
                              {index === 0 && (
                                <Badge className="bg-green-100 text-green-700 border-green-200">Best</Badge>
                              )}
                            </div>
                            {result.originalPrice > result.price && (
                              <div className="text-sm">
                                <span className="line-through text-indigo/50">${result.originalPrice}</span>
                                <span className="text-green-600 ml-2">
                                  {calculateSavings(result.price, result.originalPrice)}% off
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="border-indigo/20 text-indigo hover:bg-indigo/5 bg-transparent"
                        onClick={() => window.open(result.url, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View Deal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {userTier === "free" && (
              <Card className="border-indigo/10 bg-indigo/5">
                <CardContent className="p-4 text-center">
                  <p className="text-indigo/70 mb-3">Want to see more offers and get better deals?</p>
                  <Button
                    onClick={() => setShowUpgradeDialog(true)}
                    className="bg-indigo hover:bg-indigo/90 text-white"
                  >
                    {t("upgrade")}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <UpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        onUpgrade={() => {
          // Handle upgrade logic
          setShowUpgradeDialog(false)
        }}
      />
    </>
  )
}
