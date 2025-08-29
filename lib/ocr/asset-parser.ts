interface AssetPattern {
  keywords: string[]
  category: string
  commonBrands: string[]
  modelPatterns: RegExp[]
  serialPatterns: RegExp[]
}

interface ParsedAssetData {
  brand?: string
  model?: string
  serialNumber?: string
  name?: string
  category?: string
  confidence: number
  suggestions: {
    maintenanceTasks?: string[]
    estimatedLifespan?: string
    energyRating?: string
  }
}

// Asset recognition patterns
const ASSET_PATTERNS: AssetPattern[] = [
  {
    keywords: ["refrigerator", "fridge", "freezer", "ice maker"],
    category: "Refrigerator",
    commonBrands: ["whirlpool", "ge", "samsung", "lg", "frigidaire", "kenmore"],
    modelPatterns: [/[A-Z]{2,4}\d{3,6}[A-Z]{0,3}/g, /\b[A-Z]\d{2,4}[A-Z]{2,4}\b/g],
    serialPatterns: [/[A-Z]{1,2}\d{8,12}/g, /\d{10,15}/g],
  },
  {
    keywords: ["dishwasher", "dish washer"],
    category: "Dishwasher",
    commonBrands: ["bosch", "ge", "whirlpool", "kitchenaid", "samsung", "lg"],
    modelPatterns: [/[A-Z]{3}\d{3}[A-Z]{3,6}/g, /\b[A-Z]{2,4}\d{3,5}[A-Z]{0,3}\b/g],
    serialPatterns: [/[A-Z]{1,2}\d{8,12}/g, /\d{10,15}/g],
  },
  {
    keywords: ["washer", "washing machine", "laundry"],
    category: "Washing Machine",
    commonBrands: ["whirlpool", "ge", "samsung", "lg", "maytag", "kenmore"],
    modelPatterns: [/[A-Z]{2}\d{2}[A-Z]\d{4}[A-Z]{2}/g, /\b[A-Z]{3}\d{3,5}[A-Z]{0,3}\b/g],
    serialPatterns: [/[A-Z]{1,2}\d{8,12}/g, /\d{10,15}/g],
  },
  {
    keywords: ["dryer", "clothes dryer"],
    category: "Dryer",
    commonBrands: ["whirlpool", "ge", "samsung", "lg", "maytag", "kenmore"],
    modelPatterns: [/[A-Z]{2}\d{2}[A-Z]\d{4}[A-Z]{2}/g, /\b[A-Z]{3}\d{3,5}[A-Z]{0,3}\b/g],
    serialPatterns: [/[A-Z]{1,2}\d{8,12}/g, /\d{10,15}/g],
  },
  {
    keywords: ["oven", "range", "stove", "cooktop"],
    category: "Range/Oven",
    commonBrands: ["ge", "whirlpool", "samsung", "lg", "frigidaire", "bosch"],
    modelPatterns: [/[A-Z]{2,4}\d{3,6}[A-Z]{0,3}/g, /\b[A-Z]\d{2,4}[A-Z]{2,4}\b/g],
    serialPatterns: [/[A-Z]{1,2}\d{8,12}/g, /\d{10,15}/g],
  },
  {
    keywords: ["microwave", "micro wave"],
    category: "Microwave",
    commonBrands: ["ge", "whirlpool", "samsung", "lg", "panasonic", "sharp"],
    modelPatterns: [/[A-Z]{2,4}\d{3,6}[A-Z]{0,3}/g, /\b[A-Z]\d{2,4}[A-Z]{2,4}\b/g],
    serialPatterns: [/[A-Z]{1,2}\d{8,12}/g, /\d{10,15}/g],
  },
  {
    keywords: ["water heater", "hot water", "heater"],
    category: "Water Heater",
    commonBrands: ["rheem", "ao smith", "bradford white", "whirlpool", "ge"],
    modelPatterns: [/[A-Z]{2,4}\d{2,4}[A-Z]{0,3}/g, /\b[A-Z]\d{2,4}[A-Z]{2,4}\b/g],
    serialPatterns: [/\d{10,15}/g, /[A-Z]{1,2}\d{8,12}/g],
  },
  {
    keywords: ["hvac", "air conditioner", "furnace", "heat pump", "ac unit"],
    category: "HVAC System",
    commonBrands: ["carrier", "trane", "lennox", "rheem", "goodman", "york"],
    modelPatterns: [/[A-Z]{2,4}\d{3,6}[A-Z]{0,3}/g, /\b[A-Z]\d{2,4}[A-Z]{2,4}\b/g],
    serialPatterns: [/\d{10,15}/g, /[A-Z]{1,2}\d{8,12}/g],
  },
]

// Maintenance task suggestions by category
const MAINTENANCE_SUGGESTIONS: Record<string, string[]> = {
  Refrigerator: ["Clean coils", "Replace water filter", "Check door seals", "Clean interior"],
  Dishwasher: ["Clean filter", "Check spray arms", "Run cleaning cycle", "Inspect door seals"],
  "Washing Machine": ["Clean lint filter", "Check hoses", "Run cleaning cycle", "Level machine"],
  Dryer: ["Clean lint trap", "Clean exhaust vent", "Check drum belt", "Inspect heating element"],
  "Range/Oven": ["Clean oven interior", "Check burner ignition", "Replace oven light", "Clean range hood"],
  Microwave: ["Clean interior", "Replace charcoal filter", "Check door seals", "Test turntable"],
  "Water Heater": ["Flush tank", "Check anode rod", "Test pressure relief valve", "Insulate pipes"],
  "HVAC System": ["Replace air filter", "Clean coils", "Check refrigerant", "Inspect ductwork"],
}

// Estimated lifespans by category
const LIFESPAN_ESTIMATES: Record<string, string> = {
  Refrigerator: "10-15 years",
  Dishwasher: "8-12 years",
  "Washing Machine": "8-12 years",
  Dryer: "10-15 years",
  "Range/Oven": "15-20 years",
  Microwave: "8-10 years",
  "Water Heater": "8-12 years",
  "HVAC System": "15-25 years",
}

export function parseAssetFromText(rawText: string): ParsedAssetData {
  const text = rawText.toLowerCase()
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  let bestMatch: AssetPattern | null = null
  let matchScore = 0

  // Find the best matching asset pattern
  for (const pattern of ASSET_PATTERNS) {
    let score = 0
    for (const keyword of pattern.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += 2
      }
    }

    for (const brand of pattern.commonBrands) {
      if (text.includes(brand.toLowerCase())) {
        score += 3
      }
    }

    if (score > matchScore) {
      matchScore = score
      bestMatch = pattern
    }
  }

  const result: ParsedAssetData = {
    confidence: Math.min(matchScore * 10, 95),
    suggestions: {},
  }

  if (bestMatch) {
    result.category = bestMatch.category
    result.name = bestMatch.category
    result.suggestions.maintenanceTasks = MAINTENANCE_SUGGESTIONS[bestMatch.category]
    result.suggestions.estimatedLifespan = LIFESPAN_ESTIMATES[bestMatch.category]

    // Extract brand
    for (const brand of bestMatch.commonBrands) {
      const brandRegex = new RegExp(`\\b${brand}\\b`, "gi")
      const brandMatch = rawText.match(brandRegex)
      if (brandMatch) {
        result.brand = brandMatch[0].toUpperCase()
        break
      }
    }

    // Extract model number
    for (const modelPattern of bestMatch.modelPatterns) {
      const modelMatch = rawText.match(modelPattern)
      if (modelMatch) {
        result.model = modelMatch[0]
        break
      }
    }

    // Extract serial number
    for (const serialPattern of bestMatch.serialPatterns) {
      const serialMatch = rawText.match(serialPattern)
      if (serialMatch) {
        // Avoid using the same string as model number
        if (serialMatch[0] !== result.model) {
          result.serialNumber = serialMatch[0]
          break
        }
      }
    }

    // Look for energy rating
    const energyMatch = rawText.match(/energy\s*star|energy\s*rating|[A-F]\+*\s*rating/gi)
    if (energyMatch) {
      result.suggestions.energyRating = energyMatch[0]
    }
  }

  // Fallback parsing for common patterns
  if (!result.brand) {
    // Look for capitalized words that might be brands
    const capitalizedWords = rawText.match(/\b[A-Z][A-Z\s&]{2,15}\b/g)
    if (capitalizedWords) {
      const commonBrands = ["GE", "SAMSUNG", "LG", "WHIRLPOOL", "BOSCH", "KENMORE", "FRIGIDAIRE"]
      for (const word of capitalizedWords) {
        if (commonBrands.some((brand) => word.includes(brand))) {
          result.brand = word.trim()
          break
        }
      }
    }
  }

  if (!result.model) {
    // Look for alphanumeric model patterns
    const modelMatch = rawText.match(/\b[A-Z]{1,4}\d{2,6}[A-Z]{0,4}\b/g)
    if (modelMatch) {
      result.model = modelMatch[0]
    }
  }

  if (!result.serialNumber) {
    // Look for serial number patterns
    const serialMatch = rawText.match(/(?:serial|s\/n|sn)[\s:]*([A-Z0-9]{8,15})/gi)
    if (serialMatch) {
      const match = serialMatch[0].match(/([A-Z0-9]{8,15})$/i)
      if (match) {
        result.serialNumber = match[1]
      }
    }
  }

  // Adjust confidence based on how many fields we found
  const fieldsFound = [result.brand, result.model, result.serialNumber, result.category].filter(Boolean).length
  result.confidence = Math.max(result.confidence, fieldsFound * 20)

  return result
}

export function suggestAssetName(brand?: string, category?: string, model?: string): string {
  if (brand && category) {
    return `${brand} ${category}`
  }
  if (category) {
    return category
  }
  if (brand && model) {
    return `${brand} ${model}`
  }
  return "Unknown Appliance"
}
