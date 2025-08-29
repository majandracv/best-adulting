"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Eye, EyeOff, RotateCcw, ArrowRight, Lightbulb, Clock, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ExtractedData {
  text: string
  confidence: number
  parsedFields: {
    brand?: string
    model?: string
    serialNumber?: string
    name?: string
    category?: string
  }
  suggestions?: {
    maintenanceTasks?: string[]
    estimatedLifespan?: string
    energyRating?: string
  }
}

export default function OCRReviewPage() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [showRawText, setShowRawText] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get the captured image from sessionStorage
    const image = sessionStorage.getItem("capturedAssetImage")
    if (!image) {
      router.push("/assets/new/camera")
      return
    }
    setCapturedImage(image)

    // Start OCR processing automatically
    processImage(image)
  }, [router])

  const processImage = async (imageDataUrl: string) => {
    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/ocr/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageDataUrl }),
      })

      if (!response.ok) {
        throw new Error("OCR processing failed")
      }

      const result = await response.json()
      setExtractedData(result)
    } catch (err) {
      console.error("OCR Error:", err)
      setError("Failed to extract text from image. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const retakePhoto = () => {
    sessionStorage.removeItem("capturedAssetImage")
    router.push("/assets/new/camera")
  }

  const proceedToForm = () => {
    if (extractedData) {
      // Store extracted data for the form
      sessionStorage.setItem(
        "extractedAssetData",
        JSON.stringify({
          ...extractedData.parsedFields,
          suggestions: extractedData.suggestions,
        }),
      )
      router.push("/assets/new/form")
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-100 text-green-800"
    if (confidence >= 60) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return "High Confidence"
    if (confidence >= 60) return "Medium Confidence"
    return "Low Confidence"
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Processing Asset Information</h1>
          <p className="text-muted-foreground">Extracting text from your photo to identify asset details</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Captured Image</CardTitle>
            </CardHeader>
            <CardContent>
              {capturedImage && (
                <img
                  src={capturedImage || "/placeholder.svg"}
                  alt="Captured asset"
                  className="w-full rounded-lg border border-border"
                />
              )}
              <Button
                variant="outline"
                onClick={retakePhoto}
                className="w-full mt-4 flex items-center gap-2 bg-transparent"
              >
                <RotateCcw className="w-4 h-4" />
                Retake Photo
              </Button>
            </CardContent>
          </Card>

          {/* OCR Results */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Extracted Information
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isProcessing && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground">Processing image...</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => capturedImage && processImage(capturedImage)}
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {extractedData && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={getConfidenceColor(extractedData.confidence)}>
                      {getConfidenceLabel(extractedData.confidence)} ({extractedData.confidence}%)
                    </Badge>
                    {extractedData.parsedFields.category && (
                      <Badge variant="outline">{extractedData.parsedFields.category}</Badge>
                    )}
                  </div>

                  {/* Parsed Fields */}
                  <div className="space-y-3">
                    {Object.entries(extractedData.parsedFields).map(
                      ([key, value]) =>
                        value &&
                        key !== "category" && (
                          <div key={key} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                            <span className="font-medium capitalize text-foreground">
                              {key.replace(/([A-Z])/g, " $1").trim()}:
                            </span>
                            <span className="text-muted-foreground">{value}</span>
                          </div>
                        ),
                    )}
                  </div>

                  {extractedData.suggestions && (
                    <div className="space-y-3 pt-4 border-t border-border">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Smart Insights
                      </h4>

                      {extractedData.suggestions.estimatedLifespan && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Estimated Lifespan:</span>
                          <span className="font-medium">{extractedData.suggestions.estimatedLifespan}</span>
                        </div>
                      )}

                      {extractedData.suggestions.energyRating && (
                        <div className="flex items-center gap-2 text-sm">
                          <Zap className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Energy Rating:</span>
                          <span className="font-medium">{extractedData.suggestions.energyRating}</span>
                        </div>
                      )}

                      {extractedData.suggestions.maintenanceTasks &&
                        extractedData.suggestions.maintenanceTasks.length > 0 && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Recommended Maintenance:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {extractedData.suggestions.maintenanceTasks.slice(0, 3).map((task, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {task}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Raw Text Toggle */}
                  <div className="pt-4 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRawText(!showRawText)}
                      className="flex items-center gap-2"
                    >
                      {showRawText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {showRawText ? "Hide" : "Show"} Raw Text
                    </Button>

                    {showRawText && (
                      <div className="mt-2 p-3 bg-muted rounded-lg">
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{extractedData.text}</pre>
                      </div>
                    )}
                  </div>

                  {/* Proceed Button */}
                  <Button
                    onClick={proceedToForm}
                    className="w-full flex items-center gap-2 bg-primary hover:bg-primary/90"
                  >
                    Continue to Form
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
