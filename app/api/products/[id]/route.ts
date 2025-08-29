import { type NextRequest, NextResponse } from "next/server"
import { RetailerAPIService } from "@/lib/services/retailer-api"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const retailerService = RetailerAPIService.getInstance()
    const product = await retailerService.getProductById(params.id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error("Product fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}
