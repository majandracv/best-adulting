import { NextResponse, type NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

// Protect everything under these paths:
const PROTECTED = ["/dashboard", "/assets", "/tasks", "/booking", "/price-compare", "/profile"]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Attach Supabase to this req/res so refreshed tokens are written back
  const supabase = createMiddlewareClient({ req, res })

  // This line triggers session refresh if needed and updates the cookie on `res`
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = req.nextUrl.pathname
  const isProtected = PROTECTED.some((p) => path.startsWith(p))

  if (isProtected && !session) {
    const url = req.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("redirectedFrom", path)
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/assets/:path*",
    "/tasks/:path*",
    "/booking/:path*",
    "/price-compare/:path*",
    "/profile/:path*",
  ],
}
