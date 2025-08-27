import { updateSession } from "@/lib/supabase/middleware"
import createIntlMiddleware from "next-intl/middleware"
import type { NextRequest } from "next/server"

const intlMiddleware = createIntlMiddleware({
  locales: ["en", "es"],
  defaultLocale: "en",
})

export async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request)

  return await updateSession(request, intlResponse)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
