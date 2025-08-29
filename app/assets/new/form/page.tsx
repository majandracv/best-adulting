"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Edit3, Lightbulb } from "lucide-react"

interface ExtractedFields {
  brand?: string
  model?: string
  serialNumber?: string
  name?: string
  category?: string
}

interface Suggestions {
  maintenanceTasks?: string[]
  estimatedLifespan?: string
  energyRating?: string
}

export default function AssetFormPage() {
  const [extractedData, setExtractedData] = useState<ExtractedFields>({})
  const [suggestions, setSuggestions] = useState<Suggestions>({})
  const [formData, setFormData] = useState({
    name: "",
    room: "",
    brand: "",
    model: "",
    serialNumber: "",
    category: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTaskSuggestions, setShowTaskSuggestions] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Get extracted data from sessionStorage
    const data = sessionStorage.getItem("extractedAssetData")
    if (data) {
      const parsed = JSON.parse(data)
      setExtractedData(parsed)
      setSuggestions(parsed.suggestions || {})

      // Pre-fill form with extracted data
      setFormData((prev) => ({
        ...prev,
        name: parsed.name || "",
        brand: parsed.brand || "",
        model: parsed.model || "",
        serialNumber: parsed.serialNumber || "",
        category: parsed.category || "",
      }))

      // Show task suggestions if we have maintenance tasks
      if (parsed.suggestions?.maintenanceTasks?.length > 0) {
        setShowTaskSuggestions(true)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formDataObj = new FormData()
      formDataObj.append("name", formData.name)
      formDataObj.append("room", formData.room)
      formDataObj.append("brand", formData.brand)
      formDataObj.append("model", formData.model)
      formDataObj.append("serialNumber", formData.serialNumber)
      formDataObj.append("category", formData.category)

      const response = await fetch("/api/assets/create", {
        method: "POST",
        body: formDataObj,
      })

      if (response.ok) {
        const result = await response.json()

        // Clear session storage
        sessionStorage.removeItem("capturedAssetImage")
        sessionStorage.removeItem("extractedAssetData")

        // If we have maintenance suggestions and the asset was created, offer to add tasks
        if (suggestions.maintenanceTasks?.length > 0 && result.assetId) {
          const shouldAddTasks = confirm(
            `Asset created successfully! Would you like to add recommended maintenance tasks for this ${formData.category || "appliance"}?`,
          )

          if (shouldAddTasks) {
            // Store suggestions for task creation
            sessionStorage.setItem(
              "pendingMaintenanceTasks",
              JSON.stringify({
                assetId: result.assetId,
                assetName: formData.name,
                tasks: suggestions.maintenanceTasks,
              }),
            )
            router.push("/tasks/templates")
            return
          }
        }

        router.push("/assets")
      } else {
        throw new Error("Failed to create asset")
      }
    } catch (error) {
      console.error("Error creating asset:", error)
      alert("Failed to create asset. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFieldExtracted = (fieldName: keyof ExtractedFields) => {
    return extractedData[fieldName] !== undefined
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Review Asset Details</h1>
          <p className="text-muted-foreground">Verify and complete the information extracted from your photo</p>
        </div>

        {/* Smart Insights Card */}
        {(suggestions.estimatedLifespan || suggestions.energyRating || suggestions.maintenanceTasks?.length > 0) && (
          <Card className="mb-6 border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent-foreground">
                <Lightbulb className="w-5 h-5" />
                Smart Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestions.estimatedLifespan && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estimated Lifespan:</span>
                  <Badge variant="outline">{suggestions.estimatedLifespan}</Badge>
                </div>
              )}

              {suggestions.energyRating && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Energy Rating:</span>
                  <Badge variant="outline">{suggestions.energyRating}</Badge>
                </div>
              )}

              {suggestions.maintenanceTasks?.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Recommended Maintenance:</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTaskSuggestions(!showTaskSuggestions)}
                    >
                      {showTaskSuggestions ? "Hide" : "Show"} Tasks
                    </Button>
                  </div>

                  {showTaskSuggestions && (
                    <div className="flex flex-wrap gap-2">
                      {suggestions.maintenanceTasks.map((task, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {task}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Asset Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  Asset Name *
                  {isFieldExtracted("name") && (
                    <Badge variant="secondary" className="text-xs">
                      <Edit3 className="w-3 h-3 mr-1" />
                      Auto-filled
                    </Badge>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="e.g., Kitchen Refrigerator"
                  required
                />
              </div>

              {/* Category Field */}
              {formData.category && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    Category
                    <Badge variant="secondary" className="text-xs">
                      <Edit3 className="w-3 h-3 mr-1" />
                      Auto-detected
                    </Badge>
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                    placeholder="e.g., Refrigerator"
                  />
                </div>
              )}

              {/* Room Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Room</label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => setFormData((prev) => ({ ...prev, room: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="e.g., Kitchen"
                />
              </div>

              {/* Brand Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  Brand
                  {isFieldExtracted("brand") && (
                    <Badge variant="secondary" className="text-xs">
                      <Edit3 className="w-3 h-3 mr-1" />
                      Auto-filled
                    </Badge>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData((prev) => ({ ...prev, brand: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="e.g., Whirlpool"
                />
              </div>

              {/* Model Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  Model
                  {isFieldExtracted("model") && (
                    <Badge variant="secondary" className="text-xs">
                      <Edit3 className="w-3 h-3 mr-1" />
                      Auto-filled
                    </Badge>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="e.g., WRF535SWHZ"
                />
              </div>

              {/* Serial Number Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  Serial Number
                  {isFieldExtracted("serialNumber") && (
                    <Badge variant="secondary" className="text-xs">
                      <Edit3 className="w-3 h-3 mr-1" />
                      Auto-filled
                    </Badge>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, serialNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
                  placeholder="e.g., MH45234567"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.name}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? "Creating..." : "Create Asset"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
