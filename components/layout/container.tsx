import type React from "react"
import { cn } from "@/lib/utils"

interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "xl" | "full"
}

export function Container({ children, className, size = "lg" }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto px-4 md:px-6 lg:px-8",
        {
          "max-w-sm": size === "sm",
          "max-w-md": size === "md",
          "max-w-4xl": size === "lg",
          "max-w-6xl": size === "xl",
          "max-w-none": size === "full",
        },
        className,
      )}
    >
      {children}
    </div>
  )
}
