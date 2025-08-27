import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function SignUpSuccessPage() {
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
            <CardContent className="text-center">
              <p className="text-sm text-indigo/70 mb-6">
                Click the link in your email to verify your account and start managing your household.
              </p>
              <Button asChild className="w-full bg-indigo hover:bg-indigo/90 text-white">
                <Link href="/auth/login">Back to Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
