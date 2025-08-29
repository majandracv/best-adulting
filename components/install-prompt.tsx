"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Download, Smartphone, Monitor, Apple } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deviceType, setDeviceType] = useState<"mobile" | "desktop">("mobile")

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches
    const isMobile = window.matchMedia("(max-width: 768px)").matches

    setIsIOS(isIOSDevice)
    setIsStandalone(isInStandaloneMode)
    setDeviceType(isMobile ? "mobile" : "desktop")

    // Don't show prompt if already installed
    if (isInStandaloneMode) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    window.addEventListener("beforeinstallprompt", handler)

    if (isIOSDevice && !isInStandaloneMode) {
      setTimeout(() => {
        setShowPrompt(true)
      }, 5000)
    }

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDeferredPrompt(null)

    localStorage.setItem("installPromptDismissed", Date.now().toString())
  }

  useEffect(() => {
    const dismissed = localStorage.getItem("installPromptDismissed")
    if (dismissed) {
      const dismissedTime = Number.parseInt(dismissed)
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)

      // Don't show again for 7 days after dismissal
      if (daysSinceDismissed < 7) {
        setShowPrompt(false)
        return
      }
    }
  }, [])

  if (!showPrompt || isStandalone) return null

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 border-primary/20 shadow-lg md:left-auto md:right-4 md:w-96">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {deviceType === "mobile" ? (
              <Smartphone className="w-8 h-8 text-primary" />
            ) : (
              <Monitor className="w-8 h-8 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-primary">Install Best Adulting</h3>
              <Badge variant="secondary" className="text-xs">
                PWA
              </Badge>
            </div>
            <p className="text-sm text-muted mb-3">
              {isIOS
                ? "Add to your home screen for the best experience with offline access and notifications."
                : "Install our app for faster access, offline functionality, and push notifications."}
            </p>

            {isIOS ? (
              <div className="space-y-2 mb-3">
                <p className="text-xs text-muted flex items-center gap-1">
                  <Apple className="w-3 h-3" />
                  Tap the Share button, then "Add to Home Screen"
                </p>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleInstall} size="sm" className="bg-primary hover:bg-primary/90">
                  <Download className="w-4 h-4 mr-1" />
                  Install App
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  size="sm"
                  className="border-primary/20 bg-transparent"
                >
                  Not now
                </Button>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="grid grid-cols-2 gap-2 text-xs text-muted">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-success rounded-full"></div>
                  Offline access
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-success rounded-full"></div>
                  Push notifications
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-success rounded-full"></div>
                  Faster loading
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-success rounded-full"></div>
                  Native feel
                </div>
              </div>
            </div>
          </div>
          <Button onClick={handleDismiss} variant="ghost" size="sm" className="p-1 h-auto flex-shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
