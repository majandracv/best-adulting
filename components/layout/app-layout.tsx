import type React from "react"
import SafeNav from "../SafeNav"
import { Boundary } from "../ErrorBoundary"
import { InstallPrompt } from "../install-prompt"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-aqua/5">
      <div className="flex">
        <Boundary>
          <SafeNav />
        </Boundary>
        <main className="flex-1 md:ml-0">
          <div className="pb-20 md:pb-0">{children}</div>
        </main>
      </div>
      <InstallPrompt />
    </div>
  )
}
