"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, Package, CheckSquare, Calendar, DollarSign, User, Plus, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/assets", label: "Assets", icon: Package },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/booking", label: "Booking", icon: Calendar },
  { href: "/price-compare", label: "Compare", icon: DollarSign },
  { href: "/profile", label: "Profile", icon: User },
]

export function MobileNavigation() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
        <div className="grid grid-cols-5 gap-1 px-2 py-1">
          {navigationItems.slice(0, 4).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-12 w-full flex-col gap-1 text-xs", isActive && "bg-primary/10 text-primary")}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="truncate">{item.label}</span>
                </Button>
              </Link>
            )
          })}

          {/* Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-12 w-full flex-col gap-1 text-xs"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu className="h-4 w-4" />
            <span>More</span>
          </Button>
        </div>
      </nav>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-40 md:hidden">
        <Button size="lg" className="h-14 w-14 rounded-full shadow-lg" asChild>
          <Link href="/assets/new">
            <Plus className="h-6 w-6" />
          </Link>
        </Button>
      </div>

      {/* Full Screen Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
                      <Button variant={isActive ? "default" : "ghost"} className="w-full justify-start gap-3 h-12">
                        <item.icon className="h-5 w-5" />
                        {item.label}
                        {isActive && (
                          <Badge variant="secondary" className="ml-auto">
                            Active
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  )
                })}
              </div>

              <div className="mt-8 space-y-2">
                <h3 className="text-sm font-medium text-muted">Quick Actions</h3>
                <Link href="/assets/new" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start gap-3 bg-transparent">
                    <Plus className="h-4 w-4" />
                    Add Asset
                  </Button>
                </Link>
                <Link href="/tasks/new" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-start gap-3 bg-transparent">
                    <Plus className="h-4 w-4" />
                    Add Task
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
