"use client"

import { useEffect, useRef, useState } from "react"

interface SwipeGesture {
  direction: "left" | "right" | "up" | "down"
  distance: number
  duration: number
}

interface UseMobileGesturesOptions {
  onSwipe?: (gesture: SwipeGesture) => void
  onPullToRefresh?: () => void
  swipeThreshold?: number
  pullThreshold?: number
}

export function useMobileGestures(options: UseMobileGesturesOptions = {}) {
  const { onSwipe, onPullToRefresh, swipeThreshold = 50, pullThreshold = 100 } = options

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    let startY = 0
    let currentY = 0
    let isAtTop = false

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      }

      startY = touch.clientY
      isAtTop = element.scrollTop === 0
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return

      const touch = e.touches[0]
      currentY = touch.clientY
      const deltaY = currentY - startY

      // Handle pull-to-refresh
      if (isAtTop && deltaY > 0 && onPullToRefresh) {
        e.preventDefault()
        const distance = Math.min(deltaY * 0.5, pullThreshold * 1.5)
        setPullDistance(distance)

        if (distance >= pullThreshold && !isRefreshing) {
          // Trigger haptic feedback if available
          if ("vibrate" in navigator) {
            navigator.vibrate(50)
          }
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y
      const duration = Date.now() - touchStartRef.current.time

      // Handle swipe gestures
      if (onSwipe && (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold)) {
        let direction: SwipeGesture["direction"]

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          direction = deltaX > 0 ? "right" : "left"
        } else {
          direction = deltaY > 0 ? "down" : "up"
        }

        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        onSwipe({ direction, distance, duration })
      }

      // Handle pull-to-refresh completion
      if (pullDistance >= pullThreshold && onPullToRefresh && !isRefreshing) {
        setIsRefreshing(true)
        onPullToRefresh()

        // Reset after refresh completes
        setTimeout(() => {
          setIsRefreshing(false)
          setPullDistance(0)
        }, 2000)
      } else {
        setPullDistance(0)
      }

      touchStartRef.current = null
    }

    element.addEventListener("touchstart", handleTouchStart, { passive: false })
    element.addEventListener("touchmove", handleTouchMove, { passive: false })
    element.addEventListener("touchend", handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener("touchstart", handleTouchStart)
      element.removeEventListener("touchmove", handleTouchMove)
      element.removeEventListener("touchend", handleTouchEnd)
    }
  }, [onSwipe, onPullToRefresh, swipeThreshold, pullThreshold, pullDistance, isRefreshing])

  return {
    elementRef,
    isRefreshing,
    pullDistance,
  }
}
