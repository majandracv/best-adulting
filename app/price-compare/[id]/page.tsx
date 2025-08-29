"use client"

import { useState } from "react"
import { ArrowLeft, Share2, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProductAnalytics } from "@/components/price-compare/product-analytics"
import Link from "next/link"

// Mock data for detailed product view
const mockProductDetail = {
  id: 1,
  name: "Dyson V15 Detect Absolute Vacuum",
  category: "Appliances",
  image: "/classic-vacuum-cleaner.png",
  description: "Advanced cordless vacuum with laser dust detection and powerful suction for deep cleaning.",
  currentPrices: [
    { retailer: "Amazon", price: 649.99, originalPrice: 749.99, savings: 100 },
    { retailer: "Best Buy", price: 699.99, originalPrice: 749.99, savings: 50 },
    { retailer: "Target", price: 679.99, originalPrice: 749.99, savings: 70 },
    { retailer: "Home Depot", price: 719.99, originalPrice: 749.99, savings: 30 },
  ],
  priceHistory: [
    { date: "2024-01-01", price: 749.99, retailer: "Amazon" },
    { date: "2024-01-15", price: 699.99, retailer: "Amazon" },
    { date: "2024-02-01", price: 679.99, retailer: "Amazon" },
    { date: "2024-02-15", price: 649.99, retailer: "Amazon" },
  ],
  avgPrice: 699.99,
  lowestPrice: 649.99,
  highestPrice: 749.99,
  priceVolatility: "medium" as const,
  recommendation: "buy_now" as const,
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [isFavorited, setIsFavorited] = useState(false)
  const product = mockProductDetail

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/price-compare">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Search
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsFavorited(!isFavorited)}>
                <Heart className={`h-4 w-4 mr-2 ${isFavorited ? "fill-current text-accent" : ""}`} />
                {isFavorited ? "Favorited" : "Add to Favorites"}
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Header */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-64 object-cover rounded-lg bg-muted"
            />
          </div>
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {product.category}
                </Badge>
                <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
                <p className="text-muted-foreground mt-2">{product.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Best Price</div>
                  <div className="text-3xl font-bold text-accent">
                    ${Math.min(...product.currentPrices.map((p) => p.price))}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">You Save</div>
                  <div className="text-xl font-semibold text-accent">
                    ${Math.max(...product.currentPrices.map((p) => p.savings))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <ProductAnalytics product={product} />
      </div>
    </div>
  )
}
