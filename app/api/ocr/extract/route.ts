import { type NextRequest, NextResponse } from "next/server"
import { parseAssetFromText, suggestAssetName } from "@/lib/ocr/asset-parser"

// Simulated OCR processing function
// In a real implementation, this would use Tesseract.js or a cloud OCR service
async function processImageWithOCR(imageDataUrl: string) {
  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const mockOCRResults = [
    "WHIRLPOOL\nModel: WRF535SWHZ\nSerial: MH45234567\nRefrigerator\n25.5 Cu. Ft.\nENERGY STAR\nSide-by-Side",
    "GE APPLIANCES\nDishwasher\nModel GDT695SSJSS\nSerial VH12345678\nBuilt-In Dishwasher\nStainless Steel\nENERGY STAR",
    "Samsung\nWashing Machine\nWF45R6100AW\nS/N: 1234567890\nFront Load Washer\n4.5 Cu. Ft.\nSteam Wash",
    "RHEEM\nWater Heater\nModel: XG50T12DU38U0\nSerial: M2023456789\n50 Gallon\nNatural Gas\nEnergy Factor: 0.67",
    "Carrier\nHVAC System\nModel: 25HCB636A003\nSerial: 4318G12345\nHeat Pump\n3 Ton\n16 SEER",
    "BOSCH\nModel: SHPM65Z55N\nSerial: FD9876543210\nDishwasher\n24 Inch\nStainless Steel\nQuiet Operation",
    "LG Electronics\nMicrowave Oven\nModel: LMV2031ST\nSerial: 405KPBZ123456\nOver-the-Range\n2.0 Cu. Ft.\n1000 Watts",
  ]

  // Return a random OCR result for demo purposes
  const rawText = mockOCRResults[Math.floor(Math.random() * mockOCRResults.length)]

  const parsedData = parseAssetFromText(rawText)

  // Generate suggested name if not found
  if (!parsedData.name) {
    parsedData.name = suggestAssetName(parsedData.brand, parsedData.category, parsedData.model)
  }

  return {
    text: rawText,
    confidence: parsedData.confidence,
    parsedFields: {
      brand: parsedData.brand,
      model: parsedData.model,
      serialNumber: parsedData.serialNumber,
      name: parsedData.name,
      category: parsedData.category,
    },
    suggestions: parsedData.suggestions,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Process the image with OCR
    const result = await processImageWithOCR(image)

    return NextResponse.json(result)
  } catch (error) {
    console.error("OCR processing error:", error)
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
  }
}
