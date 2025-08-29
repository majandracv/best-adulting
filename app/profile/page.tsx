import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { ProfileTabs } from "@/components/profile/profile-tabs"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

  const { data: household } = await supabase.from("households").select("*").eq("id", profile?.household_id).single()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xl font-semibold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
              <p className="text-muted">Manage your account and household preferences</p>
            </div>
          </div>
        </div>

        <ProfileTabs user={user} profile={profile} household={household} />
      </div>
    </div>
  )
}
