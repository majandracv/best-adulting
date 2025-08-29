import { type NextRequest, NextResponse } from "next/server"
import { RetailerAPIService } from "@/lib/services/retailer-api"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")

    const retailerService = RetailerAPIService.getInstance()
    const priceHistory = await retailerService.getPriceHistory(params.id, days)

    return NextResponse.json({
      success: true,
      data: priceHistory,
      productId: params.id,
      days,
    })
  } catch (error) {
    console.error("Price history fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch price history" }, { status: 500 })
  }
}
