export interface TaskTemplate {
  id: string
  title: string
  description: string
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  category: "maintenance" | "cleaning" | "inspection" | "replacement"
  assetTypes: string[]
  estimatedTimeMin: number
  priority: "low" | "medium" | "high"
}

export const TASK_TEMPLATES: TaskTemplate[] = [
  // HVAC System Templates
  {
    id: "hvac-filter-change",
    title: "Change HVAC Filter",
    description:
      "Replace air filter to maintain air quality and system efficiency. Check filter size and type before purchasing replacement.",
    frequency: "quarterly",
    category: "maintenance",
    assetTypes: ["HVAC", "Air Conditioner", "Furnace", "Heat Pump"],
    estimatedTimeMin: 15,
    priority: "high",
  },
  {
    id: "hvac-annual-service",
    title: "Annual HVAC Service",
    description: "Professional inspection and maintenance of HVAC system. Schedule before peak season.",
    frequency: "yearly",
    category: "maintenance",
    assetTypes: ["HVAC", "Air Conditioner", "Furnace", "Heat Pump"],
    estimatedTimeMin: 120,
    priority: "high",
  },

  // Water Heater Templates
  {
    id: "water-heater-flush",
    title: "Flush Water Heater Tank",
    description: "Drain and flush water heater tank to remove sediment buildup and maintain efficiency.",
    frequency: "yearly",
    category: "maintenance",
    assetTypes: ["Water Heater", "Hot Water Tank"],
    estimatedTimeMin: 60,
    priority: "medium",
  },
  {
    id: "water-heater-anode-rod",
    title: "Check Anode Rod",
    description: "Inspect and replace anode rod if necessary to prevent tank corrosion.",
    frequency: "yearly",
    category: "inspection",
    assetTypes: ["Water Heater", "Hot Water Tank"],
    estimatedTimeMin: 30,
    priority: "medium",
  },

  // Appliance Templates
  {
    id: "refrigerator-coils",
    title: "Clean Refrigerator Coils",
    description: "Vacuum or brush clean the condenser coils on the back or bottom of refrigerator.",
    frequency: "quarterly",
    category: "cleaning",
    assetTypes: ["Refrigerator", "Fridge"],
    estimatedTimeMin: 20,
    priority: "medium",
  },
  {
    id: "dishwasher-filter",
    title: "Clean Dishwasher Filter",
    description: "Remove and clean the dishwasher filter to prevent clogs and maintain cleaning performance.",
    frequency: "monthly",
    category: "cleaning",
    assetTypes: ["Dishwasher"],
    estimatedTimeMin: 10,
    priority: "medium",
  },
  {
    id: "washing-machine-clean",
    title: "Clean Washing Machine",
    description: "Run cleaning cycle or clean with vinegar to remove buildup and odors.",
    frequency: "monthly",
    category: "cleaning",
    assetTypes: ["Washing Machine", "Washer"],
    estimatedTimeMin: 15,
    priority: "medium",
  },

  // General Home Templates
  {
    id: "smoke-detector-battery",
    title: "Replace Smoke Detector Batteries",
    description: "Test smoke detectors and replace batteries. Replace entire unit every 10 years.",
    frequency: "yearly",
    category: "replacement",
    assetTypes: ["Smoke Detector", "Fire Alarm"],
    estimatedTimeMin: 30,
    priority: "high",
  },
  {
    id: "gutter-cleaning",
    title: "Clean Gutters",
    description: "Remove leaves and debris from gutters and downspouts. Check for damage.",
    frequency: "quarterly",
    category: "cleaning",
    assetTypes: ["Gutters", "Roof"],
    estimatedTimeMin: 90,
    priority: "medium",
  },
  {
    id: "air-vent-cleaning",
    title: "Clean Air Vents",
    description: "Remove and wash air vent covers. Vacuum out ductwork opening.",
    frequency: "quarterly",
    category: "cleaning",
    assetTypes: ["HVAC", "Air Vents"],
    estimatedTimeMin: 45,
    priority: "low",
  },
]

export function getTemplatesForAsset(assetName: string, assetBrand?: string): TaskTemplate[] {
  const searchTerms = [assetName, assetBrand].filter(Boolean).map((term) => term?.toLowerCase())

  return TASK_TEMPLATES.filter((template) =>
    template.assetTypes.some((assetType) =>
      searchTerms.some((term) => assetType.toLowerCase().includes(term!) || term!.includes(assetType.toLowerCase())),
    ),
  )
}

export function getTemplateById(id: string): TaskTemplate | undefined {
  return TASK_TEMPLATES.find((template) => template.id === id)
}

export function calculateNextDueDate(frequency: string, fromDate: Date = new Date()): Date {
  const nextDue = new Date(fromDate)

  switch (frequency) {
    case "daily":
      nextDue.setDate(nextDue.getDate() + 1)
      break
    case "weekly":
      nextDue.setDate(nextDue.getDate() + 7)
      break
    case "monthly":
      nextDue.setMonth(nextDue.getMonth() + 1)
      break
    case "quarterly":
      nextDue.setMonth(nextDue.getMonth() + 3)
      break
    case "yearly":
      nextDue.setFullYear(nextDue.getFullYear() + 1)
      break
    default:
      nextDue.setMonth(nextDue.getMonth() + 1) // Default to monthly
  }

  return nextDue
}
