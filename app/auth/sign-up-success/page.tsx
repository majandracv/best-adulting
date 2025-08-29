"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, Mail, AlertCircle } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function SignUpSuccessPage() {
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState("")

  const handleResendEmail = async () => {
    setIsResending(true)
    setResendMessage("")

    const email = localStorage.getItem("signup-email")
    if (!email) {
      setResendMessage("Unable to resend - please try signing up again")
      setIsResending(false)
      return
    }

    const supabase = createClient()
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/dashboard`,
        },
      })

      if (error) throw error
      setResendMessage("Confirmation email sent! Check your inbox and spam folder.")
    } catch (error) {
      setResendMessage("Failed to resend email. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-lime/10 to-lemon/10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-indigo font-heading">Best Adulting</h1>
          </div>
          <Card className="border-indigo/10 shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-lime/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-lime" />
              </div>
              <CardTitle className="text-2xl text-indigo">Check Your Email</CardTitle>
              <CardDescription className="text-indigo/70">
                We've sent you a confirmation link to complete your registration
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-indigo/70">
                Click the link in your email to verify your account and start managing your household.
              </p>

              <div className="bg-orange/10 border border-orange/20 rounded-lg p-4 text-left">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-orange">Can't find the email?</p>
                    <ul className="text-xs text-indigo/70 space-y-1">
                      <li>• Check your spam/junk folder</li>
                      <li>• Look for an email from noreply@mail.app.supabase.io</li>
                      <li>• Wait a few minutes - emails can be delayed</li>
                    </ul>
                  </div>
                </div>
              </div>

              {resendMessage && (
                <div className="bg-lime/10 border border-lime/20 rounded-lg p-3">
                  <p className="text-sm text-lime">{resendMessage}</p>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  variant="outline"
                  className="w-full border-indigo/20 text-indigo hover:bg-indigo/5 bg-transparent"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {isResending ? "Sending..." : "Resend Confirmation Email"}
                </Button>

                <Button asChild className="w-full bg-indigo hover:bg-indigo/90 text-white">
                  <Link href="/auth/login">Back to Sign In</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
