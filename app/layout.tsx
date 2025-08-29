import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { InstallPrompt } from "@/components/install-prompt"
import { Toaster } from "@/components/ui/sonner"
import { FeedbackWidget } from "@/components/feedback/feedback-widget"

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
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  colorScheme: "light dark",
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
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-startup-image" href="/icon-512.png" />
      </head>
      <body className="font-sans antialiased touch-manipulation">
        {children}
        <InstallPrompt />
        <Toaster position="bottom-right" expand={true} richColors={true} closeButton={true} />
        <FeedbackWidget />
      </body>
    </html>
  )
}
