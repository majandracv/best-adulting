"use client"

import Link from "next/link"
import { usePathname, useParams } from "next/navigation"
import { Home, Package, CheckSquare, DollarSign, Calendar, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

export function MobileNav() {
  const pathname = usePathname()
  const params = useParams()
  const t = useTranslations("navigation")
  const locale = params.locale as string

  const navItems = [
    {
      href: `/${locale}/dashboard`,
      label: t("dashboard"),
      icon: Home,
    },
    {
      href: `/${locale}/assets`,
      label: t("assets"),
      icon: Package,
    },
    {
      href: `/${locale}/tasks`,
      label: t("tasks"),
      icon: CheckSquare,
    },
    {
      href: `/${locale}/shop`,
      label: t("priceCompare"),
      icon: DollarSign,
    },
    {
      href: `/${locale}/booking`,
      label: t("booking"),
      icon: Calendar,
    },
    {
      href: `/${locale}/profile`,
      label: t("profile"),
      icon: User,
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-indigo/10 md:hidden">
      <div className="grid grid-cols-6 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
                isActive ? "text-indigo bg-indigo/5" : "text-indigo/60 hover:text-indigo",
              )}
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
