import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import webpush from "web-push"

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  "mailto:support@bestadulting.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || "",
)

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { title, body, data, userIds } = await request.json()

    // Get push subscriptions for target users
    let query = supabase.from("push_subscriptions").select("*")

    if (userIds && userIds.length > 0) {
      query = query.in("user_id", userIds)
    } else {
      // Send to current user only
      query = query.eq("user_id", user.id)
    }

    const { data: subscriptions, error } = await query

    if (error) {
      console.error("[v0] Failed to fetch subscriptions:", error)
      return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: "No subscriptions found" })
    }

    // Send notifications to all subscriptions
    const promises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh_key,
          auth: sub.auth_key,
        },
      }

      const payload = JSON.stringify({
        title: title || "Best Adulting",
        body: body || "You have new updates!",
        data: data || {},
      })

      try {
        await webpush.sendNotification(pushSubscription, payload)
        console.log("[v0] Push notification sent successfully")
      } catch (error) {
        console.error("[v0] Failed to send push notification:", error)
        // Remove invalid subscriptions
        if (error.statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id)
        }
      }
    })

    await Promise.all(promises)

    return NextResponse.json({ success: true, sent: subscriptions.length })
  } catch (error) {
    console.error("[v0] Push send error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
