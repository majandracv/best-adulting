import { type NextRequest, NextResponse } from "next/server"
import { RetailerAPIService } from "@/lib/services/retailer-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const category = searchParams.get("category")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const inStock = searchParams.get("inStock")
    const sortBy = searchParams.get("sortBy")

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    const retailerService = RetailerAPIService.getInstance()
    const filters = {
      category: category || undefined,
      minPrice: minPrice ? Number.parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? Number.parseFloat(maxPrice) : undefined,
      inStock: inStock === "true",
      sortBy: (sortBy as any) || undefined,
    }

    const products = await retailerService.searchProducts(query, filters)

    return NextResponse.json({
      success: true,
      data: products,
      count: products.length,
      query,
      filters,
    })
  } catch (error) {
    console.error("Product search error:", error)
    return NextResponse.json({ error: "Failed to search products" }, { status: 500 })
  }
}
