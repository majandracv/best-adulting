"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, CheckSquare, DollarSign, Calendar, User } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/assets", label: "Assets", icon: Package },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/shop", label: "Shop", icon: DollarSign },
  { href: "/booking", label: "Booking", icon: Calendar },
  { href: "/profile", label: "Profile", icon: User },
]

export function MobileNav() {
  const pathname = usePathname() ?? ""

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-indigo/10 md:hidden">
      <div className="grid grid-cols-6 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
                isActive ? "text-indigo bg-indigo/5" : "text-indigo/60 hover:text-indigo"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
