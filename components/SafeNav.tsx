"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/assets", label: "Assets" },
  { href: "/tasks", label: "Tasks" },
  { href: "/price-compare", label: "Price Compare" },
  { href: "/booking", label: "Booking" },
  { href: "/profile", label: "Profile" },
]

export default function SafeNav() {
  const pathname = usePathname() ?? ""
  return (
    <nav className="w-64 p-4 hidden md:block">
      <ul className="space-y-1">
        {LINKS.map(({ href, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <li key={href}>
              <Link
                href={href}
                className={`block rounded-md px-3 py-2 ${active ? "bg-gray-100 font-medium" : "hover:bg-gray-50"}`}
              >
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
