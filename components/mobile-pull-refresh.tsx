"use client"

import type React from "react"

import { RefreshCw } from "lucide-react"
import { useMobileGestures } from "@/hooks/use-mobile-gestures"

interface MobilePullRefreshProps {
  onRefresh: () => void
  children: React.ReactNode
  className?: string
}

export function MobilePullRefresh({ onRefresh, children, className = "" }: MobilePullRefreshProps) {
  const { elementRef, isRefreshing, pullDistance } = useMobileGestures({
    onPullToRefresh: onRefresh,
  })

  const refreshOpacity = Math.min(pullDistance / 100, 1)
  const refreshRotation = (pullDistance / 100) * 360

  return (
    <div ref={elementRef} className={`relative overflow-auto ${className}`}>
      {/* Pull-to-refresh indicator */}
      <div
        className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 items-center justify-center transition-all duration-200"
        style={{
          transform: `translateX(-50%) translateY(${Math.max(pullDistance - 50, -50)}px)`,
          opacity: refreshOpacity,
        }}
      >
        <div className="rounded-full bg-background/90 p-2 shadow-lg backdrop-blur-sm">
          <RefreshCw
            className={`h-5 w-5 text-primary transition-transform duration-200 ${isRefreshing ? "animate-spin" : ""}`}
            style={{
              transform: `rotate(${refreshRotation}deg)`,
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${Math.min(pullDistance * 0.3, 30)}px)`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
