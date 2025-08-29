"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Camera, RotateCcw, Check, X, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CameraCapturePage() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Unable to access camera. Please check permissions.")
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.8)
    setCapturedImage(imageDataUrl)
    setIsCapturing(false)
    stopCamera()
  }, [stopCamera])

  const retakePhoto = useCallback(() => {
    setCapturedImage(null)
    setIsCapturing(true)
    startCamera()
  }, [startCamera])

  const proceedWithImage = useCallback(() => {
    if (capturedImage) {
      // Store the image in sessionStorage to pass to the form
      sessionStorage.setItem("capturedAssetImage", capturedImage)
      router.push("/assets/new/ocr-review")
    }
  }, [capturedImage, router])

  // Start camera on component mount
  useState(() => {
    setIsCapturing(true)
    startCamera()

    return () => stopCamera()
  })

  if (capturedImage) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col">
        <div className="flex-1 relative">
          <img
            src={capturedImage || "/placeholder.svg"}
            alt="Captured asset"
            className="w-full h-full object-contain bg-muted"
          />

          {/* Review overlay */}
          <div className="absolute top-4 left-4 right-4">
            <div className="bg-card/90 backdrop-blur-sm rounded-lg p-4">
              <h2 className="font-semibold text-card-foreground mb-2">Photo Captured</h2>
              <p className="text-sm text-muted-foreground">Review your photo. Make sure text is clear and readable.</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-6 bg-card border-t border-border">
          <div className="flex gap-4 max-w-md mx-auto">
            <Button variant="outline" onClick={retakePhoto} className="flex-1 flex items-center gap-2 bg-transparent">
              <RotateCcw className="w-4 h-4" />
              Retake
            </Button>
            <Button
              onClick={proceedWithImage}
              className="flex-1 flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              <Check className="w-4 h-4" />
              Use Photo
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Camera viewfinder */}
      <div className="flex-1 relative overflow-hidden">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

        {showGrid && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
          </div>
        )}

        {/* Instructions overlay */}
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-card/90 backdrop-blur-sm rounded-lg p-4">
            <h2 className="font-semibold text-card-foreground mb-2">Capture Asset Information</h2>
            <p className="text-sm text-muted-foreground">
              Position the appliance label or nameplate in the center. Ensure text is clear and well-lit.
            </p>
          </div>
        </div>

        {/* Settings button */}
        <button
          onClick={() => setShowGrid(!showGrid)}
          className="absolute top-4 right-4 p-2 bg-card/90 backdrop-blur-sm rounded-full text-card-foreground hover:bg-card"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Camera controls */}
      <div className="p-6 bg-card border-t border-border">
        <div className="flex items-center justify-center gap-8">
          <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <button
            onClick={capturePhoto}
            disabled={!isCapturing}
            className="w-16 h-16 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground rounded-full flex items-center justify-center transition-colors"
          >
            <Camera className="w-8 h-8 text-primary-foreground" />
          </button>
          <div className="w-20" /> {/* Spacer for symmetry */}
        </div>
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
