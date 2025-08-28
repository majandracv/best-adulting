"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, CheckSquare, DollarSign, Calendar, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/assets", label: "Assets", icon: Package },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/shop", label: "Price Compare", icon: DollarSign },
  { href: "/booking", label: "Booking", icon: Calendar },
  { href: "/profile", label: "Profile", icon: User },
]

export function DesktopNav() {
  const pathname = usePathname() ?? ""
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <nav className="hidden md:flex md:flex-col md:w-64 md:bg-white md:border-r md:border-indigo/10 md:min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-indigo font-heading">Best Adulting</h1>
        <p className="text-sm text-indigo/70 mt-1">Household Management</p>
      </div>

      <div className="flex-1 px-4">
        <ul className="space-y-2">
          {links.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-indigo text-white" : "text-indigo/70 hover:text-indigo hover:bg-indigo/5"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="p-4 border-t border-indigo/10">
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start text-indigo/70 hover:text-indigo hover:bg-indigo/5"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </Button>
      </div>
    </nav>
  )
}
