"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, BellOff, Smartphone, CheckCircle, XCircle } from "lucide-react"
import { pushManager } from "@/lib/push-notifications"
import { toast } from "sonner"

export function PushNotificationSetup() {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    checkSupport()
    checkPermission()
    checkSubscription()
  }, [])

  const checkSupport = () => {
    const isSupported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window
    setSupported(isSupported)
  }

  const checkPermission = () => {
    if ("Notification" in window) {
      setPermission(Notification.permission)
    }
  }

  const checkSubscription = async () => {
    try {
      const subscription = await pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error("[v0] Failed to check subscription:", error)
    }
  }

  const handleEnableNotifications = async () => {
    setLoading(true)
    try {
      // Initialize service worker
      const initialized = await pushManager.initialize()
      if (!initialized) {
        toast.error("Failed to initialize push notifications")
        return
      }

      // Request permission
      const permission = await pushManager.requestPermission()
      setPermission(permission)

      if (permission !== "granted") {
        toast.error("Push notifications permission denied")
        return
      }

      // Subscribe to push notifications
      const subscription = await pushManager.subscribe()
      if (!subscription) {
        toast.error("Failed to create push subscription")
        return
      }

      // Send subscription to server
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      })

      if (!response.ok) {
        throw new Error("Failed to save subscription")
      }

      setIsSubscribed(true)
      toast.success("Push notifications enabled successfully!")
    } catch (error) {
      console.error("[v0] Failed to enable notifications:", error)
      toast.error("Failed to enable push notifications")
    } finally {
      setLoading(false)
    }
  }

  const handleDisableNotifications = async () => {
    setLoading(true)
    try {
      // Unsubscribe from push notifications
      const unsubscribed = await pushManager.unsubscribe()
      if (!unsubscribed) {
        toast.error("Failed to disable push notifications")
        return
      }

      // Remove subscription from server
      const response = await fetch("/api/push/subscribe", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove subscription")
      }

      setIsSubscribed(false)
      toast.success("Push notifications disabled")
    } catch (error) {
      console.error("[v0] Failed to disable notifications:", error)
      toast.error("Failed to disable push notifications")
    } finally {
      setLoading(false)
    }
  }

  const handleTestNotification = async () => {
    try {
      const response = await fetch("/api/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Test Notification",
          body: "This is a test notification from Best Adulting!",
          data: { test: true },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send test notification")
      }

      toast.success("Test notification sent!")
    } catch (error) {
      console.error("[v0] Failed to send test notification:", error)
      toast.error("Failed to send test notification")
    }
  }

  if (!supported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5" />
            Push Notifications Not Supported
          </CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or
            Safari.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>Get instant notifications for tasks, bookings, and price alerts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              {permission === "granted" && isSubscribed ? (
                <Badge variant="default" className="bg-success text-success-foreground">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Enabled
                </Badge>
              ) : permission === "denied" ? (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Blocked
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Bell className="w-3 h-3 mr-1" />
                  Disabled
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted">
              {permission === "granted" && isSubscribed
                ? "You will receive push notifications for important updates"
                : permission === "denied"
                  ? "Push notifications are blocked. Please enable them in your browser settings."
                  : "Enable push notifications to stay updated on household tasks and alerts"}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {!isSubscribed || permission !== "granted" ? (
            <Button
              onClick={handleEnableNotifications}
              disabled={loading || permission === "denied"}
              className="flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              {loading ? "Enabling..." : "Enable Notifications"}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleDisableNotifications}
                disabled={loading}
                className="flex items-center gap-2 bg-transparent"
              >
                <BellOff className="w-4 h-4" />
                {loading ? "Disabling..." : "Disable"}
              </Button>
              <Button variant="secondary" onClick={handleTestNotification} className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Test Notification
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
