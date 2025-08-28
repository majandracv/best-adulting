"use client"
import { useState } from "react"
import type React from "react"

import { createClient } from "@/lib/supabase/client" // our browser client
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return setError(error.message)
    router.replace("/dashboard")
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="text-3xl font-semibold text-center mb-2">Best Adulting</h1>
      <p className="text-center text-muted-foreground mb-8">Welcome back to your household hub</p>
      <form onSubmit={onSubmit} className="space-y-4 bg-card border rounded-xl p-6">
        <div className="space-y-2">
          <label htmlFor="login-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="login-email"
            required
            type="email"
            className="w-full rounded-md border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="login-password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="login-password"
            required
            type="password"
            className="w-full rounded-md border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-md bg-[#23284c] text-white py-2 font-medium disabled:opacity-60 hover:bg-[#1a1f3a] transition-colors"
          disabled={loading}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a href="/auth/sign-up" className="underline">
            Sign up
          </a>
        </p>
      </form>
    </div>
  )
}
