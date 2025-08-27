import type React from "react"
import { MobileNav } from "./mobile-nav"
import { DesktopNav } from "./desktop-nav"
import { InstallPrompt } from "../install-prompt"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lavender/5 to-aqua/5">
      <div className="flex">
        <DesktopNav />
        <main className="flex-1 md:ml-0">
          <div className="pb-20 md:pb-0">{children}</div>
        </main>
      </div>
      <MobileNav />
      <InstallPrompt />
    </div>
  )
}
