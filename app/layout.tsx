import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Best Adulting - Household Management Made Simple",
  description: "Track assets, manage tasks, and keep your household organized with Best Adulting",
  generator: "v0.app",
  manifest: "/manifest.json",
  applicationName: "Best Adulting",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Best Adulting",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Best Adulting",
    title: "Best Adulting - Household Management Made Simple",
    description: "Track assets, manage tasks, and keep your household organized with Best Adulting",
  },
  twitter: {
    card: "summary",
    title: "Best Adulting - Household Management Made Simple",
    description: "Track assets, manage tasks, and keep your household organized with Best Adulting",
  },
}

export const viewport: Viewport = {
  themeColor: "#23284C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Best Adulting" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
