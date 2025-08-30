"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AlertTriangle, Info } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation first
    if (!email || !password || !repeatPassword) {
      setError("Please fill in all fields")
      return
    }

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      console.log("[v0] Starting sign-up process for email:", email)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        },
      })

      console.log("[v0] Sign-up response:", { data, error })

      if (error) {
        console.log("[v0] Sign-up error:", error)
        if (error.message === "User already registered") {
          setError("An account with this email already exists. Please sign in instead.")
          return
        }
        throw error
      }

      console.log("[v0] User data:", data.user)
      console.log("[v0] Session data:", data.session)

      if (data.user) {
        console.log("[v0] User created successfully, redirecting to dashboard")
        router.push("/dashboard")
      } else {
        console.log("[v0] No user data, redirecting to success page")
        localStorage.setItem("signup-email", email)
        router.push("/auth/sign-up-success")
      }
    } catch (error: unknown) {
      console.log("[v0] Caught error:", error)
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          setError("Connection error. Please check your internet connection and try again.")
        } else if (error.message === "User already registered") {
          setError("An account with this email already exists. Please sign in instead.")
        } else {
          setError(error.message)
        }
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-lime/10 to-lemon/10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-indigo font-heading">Best Adulting</h1>
            <p className="text-indigo/70 mt-2">Start managing your household like a pro</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Password Security Notice</p>
                <p>
                  If your browser shows a password security warning, please use a different, more secure password that
                  hasn't been found in data breaches.
                </p>
              </div>
            </div>
          </div>

          <Card className="border-indigo/10 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-indigo">Create Account</CardTitle>
              <CardDescription className="text-indigo/70">Join thousands making adulting easier</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} key="signup-form">
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email-input" className="text-indigo">
                      Email
                    </Label>
                    <Input
                      id="email-input"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-indigo/20 focus:border-lime"
                      key="email-field"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password-input" className="text-indigo">
                      Password
                    </Label>
                    <Input
                      id="password-input"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-indigo/20 focus:border-lime"
                      minLength={6}
                      key="password-field"
                    />
                    <p className="text-xs text-indigo/60">Use a strong, unique password (minimum 6 characters)</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirm-password-input" className="text-indigo">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirm-password-input"
                      name="confirmPassword"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      className="border-indigo/20 focus:border-lime"
                      minLength={6}
                      key="confirm-password-field"
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                      <div className="text-sm text-red-700">
                        <p>{error}</p>
                        {error.includes("already exists") && (
                          <Link
                            href="/auth/login"
                            className="text-red-800 hover:text-red-900 underline underline-offset-2 mt-1 inline-block"
                          >
                            Go to sign in page →
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-lime hover:bg-lime/90 text-indigo font-semibold py-3 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-indigo/70">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-lime hover:text-lime/80 underline underline-offset-4">
                    Sign in
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
