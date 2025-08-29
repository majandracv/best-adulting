// Retailer API integration service
export interface RetailerProduct {
  id: string
  name: string
  price: number
  originalPrice?: number
  savings?: number
  availability: "in_stock" | "out_of_stock" | "limited"
  retailer: string
  url: string
  image?: string
  rating?: number
  reviewCount?: number
  lastUpdated: string
}

export interface SearchFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  sortBy?: "price_low" | "price_high" | "relevance" | "rating"
}

// Mock retailer configurations - in production, these would be real API endpoints
const RETAILER_CONFIGS = {
  amazon: {
    name: "Amazon",
    baseUrl: "https://api.amazon.com",
    apiKey: process.env.AMAZON_API_KEY,
    rateLimit: 100, // requests per minute
  },
  bestbuy: {
    name: "Best Buy",
    baseUrl: "https://api.bestbuy.com",
    apiKey: process.env.BESTBUY_API_KEY,
    rateLimit: 50,
  },
  target: {
    name: "Target",
    baseUrl: "https://api.target.com",
    apiKey: process.env.TARGET_API_KEY,
    rateLimit: 75,
  },
  homedepot: {
    name: "Home Depot",
    baseUrl: "https://api.homedepot.com",
    apiKey: process.env.HOMEDEPOT_API_KEY,
    rateLimit: 60,
  },
}

// Simulated retailer data - in production, this would fetch from real APIs
const MOCK_RETAILER_DATA: Record<string, RetailerProduct[]> = {
  "vacuum cleaner": [
    {
      id: "amz-dyson-v15",
      name: "Dyson V15 Detect Absolute Vacuum",
      price: 649.99,
      originalPrice: 749.99,
      savings: 100,
      availability: "in_stock",
      retailer: "Amazon",
      url: "https://amazon.com/dp/example",
      rating: 4.5,
      reviewCount: 1247,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "bb-dyson-v15",
      name: "Dyson V15 Detect Absolute Vacuum",
      price: 699.99,
      originalPrice: 749.99,
      savings: 50,
      availability: "in_stock",
      retailer: "Best Buy",
      url: "https://bestbuy.com/example",
      rating: 4.4,
      reviewCount: 892,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "tgt-dyson-v15",
      name: "Dyson V15 Detect Absolute Vacuum",
      price: 679.99,
      originalPrice: 749.99,
      savings: 70,
      availability: "limited",
      retailer: "Target",
      url: "https://target.com/example",
      rating: 4.3,
      reviewCount: 634,
      lastUpdated: new Date().toISOString(),
    },
  ],
  "stand mixer": [
    {
      id: "amz-kitchenaid-mixer",
      name: "KitchenAid Artisan Stand Mixer",
      price: 349.99,
      originalPrice: 429.99,
      savings: 80,
      availability: "in_stock",
      retailer: "Amazon",
      url: "https://amazon.com/dp/mixer",
      rating: 4.7,
      reviewCount: 2156,
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "ws-kitchenaid-mixer",
      name: "KitchenAid Artisan Stand Mixer",
      price: 379.99,
      originalPrice: 429.99,
      savings: 50,
      availability: "in_stock",
      retailer: "Williams Sonoma",
      url: "https://williams-sonoma.com/mixer",
      rating: 4.8,
      reviewCount: 543,
      lastUpdated: new Date().toISOString(),
    },
  ],
}

export class RetailerAPIService {
  private static instance: RetailerAPIService
  private cache = new Map<string, { data: RetailerProduct[]; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  static getInstance(): RetailerAPIService {
    if (!RetailerAPIService.instance) {
      RetailerAPIService.instance = new RetailerAPIService()
    }
    return RetailerAPIService.instance
  }

  async searchProducts(query: string, filters?: SearchFilters): Promise<RetailerProduct[]> {
    const cacheKey = `search:${query}:${JSON.stringify(filters)}`

    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      // Simulate API calls to multiple retailers
      const results = await this.fetchFromAllRetailers(query, filters)

      // Cache the results
      this.cache.set(cacheKey, { data: results, timestamp: Date.now() })

      return results
    } catch (error) {
      console.error("Error fetching from retailers:", error)
      // Return cached data if available, even if expired
      return cached?.data || []
    }
  }

  private async fetchFromAllRetailers(query: string, filters?: SearchFilters): Promise<RetailerProduct[]> {
    const retailers = Object.keys(RETAILER_CONFIGS)
    const promises = retailers.map((retailer) => this.fetchFromRetailer(retailer, query, filters))

    // Wait for all retailers to respond, but don't fail if some are down
    const results = await Promise.allSettled(promises)

    const allProducts: RetailerProduct[] = []
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        allProducts.push(...result.value)
      }
    })

    return this.sortAndFilterResults(allProducts, filters)
  }

  private async fetchFromRetailer(
    retailer: string,
    query: string,
    filters?: SearchFilters,
  ): Promise<RetailerProduct[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))

    // In production, this would make actual HTTP requests to retailer APIs
    const mockData = MOCK_RETAILER_DATA[query.toLowerCase()] || []
    return mockData.filter(
      (product) => product.retailer === RETAILER_CONFIGS[retailer as keyof typeof RETAILER_CONFIGS]?.name,
    )
  }

  private sortAndFilterResults(products: RetailerProduct[], filters?: SearchFilters): RetailerProduct[] {
    let filtered = [...products]

    // Apply filters
    if (filters?.minPrice) {
      filtered = filtered.filter((p) => p.price >= filters.minPrice!)
    }
    if (filters?.maxPrice) {
      filtered = filtered.filter((p) => p.price <= filters.maxPrice!)
    }
    if (filters?.inStock) {
      filtered = filtered.filter((p) => p.availability === "in_stock")
    }

    // Apply sorting
    switch (filters?.sortBy) {
      case "price_low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price_high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case "relevance":
      default:
        // Keep original order for relevance
        break
    }

    return filtered
  }

  async getProductById(productId: string): Promise<RetailerProduct | null> {
    // Search through all mock data to find the product
    for (const products of Object.values(MOCK_RETAILER_DATA)) {
      const product = products.find((p) => p.id === productId)
      if (product) return product
    }
    return null
  }

  async getPriceHistory(
    productId: string,
    days = 30,
  ): Promise<Array<{ date: string; price: number; retailer: string }>> {
    // Simulate price history data
    const product = await this.getProductById(productId)
    if (!product) return []

    const history = []
    const currentDate = new Date()

    for (let i = days; i >= 0; i--) {
      const date = new Date(currentDate)
      date.setDate(date.getDate() - i)

      // Simulate price fluctuations
      const basePrice = product.originalPrice || product.price
      const variation = (Math.random() - 0.5) * 0.2 // ±10% variation
      const price = Math.max(basePrice * (1 + variation), product.price * 0.8)

      history.push({
        date: date.toISOString().split("T")[0],
        price: Math.round(price * 100) / 100,
        retailer: product.retailer,
      })
    }

    return history
  }
}
