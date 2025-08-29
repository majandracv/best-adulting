"use client"

import type { Provider } from "@/lib/actions/providers"
import { ProviderCard } from "./provider-card"
import { useState } from "react"

interface ProviderDirectoryProps {
  providers: Provider[]
}

export function ProviderDirectory({ providers }: ProviderDirectoryProps) {
  const [sortBy, setSortBy] = useState<"rating" | "price" | "experience">("rating")

  const sortedProviders = [...providers].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      case "price":
        return (a.hourly_rate_cents || 0) - (b.hourly_rate_cents || 0)
      case "experience":
        return (b.years_experience || 0) - (a.years_experience || 0)
      default:
        return 0
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">{providers.length} providers found</p>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-border rounded-md bg-input text-foreground"
        >
          <option value="rating">Sort by Rating</option>
          <option value="price">Sort by Price</option>
          <option value="experience">Sort by Experience</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedProviders.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>

      {providers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No providers found matching your criteria</p>
          <p className="text-muted-foreground mt-2">Try adjusting your filters or search in a different area</p>
        </div>
      )}
    </div>
  )
}
