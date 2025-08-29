"use client"

import { useState } from "react"
import type { RetailerProduct, SearchFilters } from "@/lib/services/retailer-api"

interface UseProductSearchResult {
  products: RetailerProduct[]
  loading: boolean
  error: string | null
  search: (query: string, filters?: SearchFilters) => Promise<void>
  refetch: () => Promise<void>
}

export function useProductSearch(): UseProductSearchResult {
  const [products, setProducts] = useState<RetailerProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastQuery, setLastQuery] = useState<{ query: string; filters?: SearchFilters } | null>(null)

  const search = async (query: string, filters?: SearchFilters) => {
    if (!query.trim()) {
      setProducts([])
      return
    }

    setLoading(true)
    setError(null)
    setLastQuery({ query, filters })

    try {
      const params = new URLSearchParams({ q: query })
      if (filters?.category) params.append("category", filters.category)
      if (filters?.minPrice) params.append("minPrice", filters.minPrice.toString())
      if (filters?.maxPrice) params.append("maxPrice", filters.maxPrice.toString())
      if (filters?.inStock) params.append("inStock", "true")
      if (filters?.sortBy) params.append("sortBy", filters.sortBy)

      const response = await fetch(`/api/products/search?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to search products")
      }

      setProducts(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const refetch = async () => {
    if (lastQuery) {
      await search(lastQuery.query, lastQuery.filters)
    }
  }

  return {
    products,
    loading,
    error,
    search,
    refetch,
  }
}
