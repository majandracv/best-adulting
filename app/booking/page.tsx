import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { ProviderList } from "@/components/booking/provider-list"

export default async function BookingPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user's household
  const { data: household } = await supabase.from("households").select("*").eq("owner_id", data.user.id).single()

  if (!household) {
    redirect("/dashboard")
  }

  // Get providers with ratings and availability
  const { data: providers } = await supabase
    .from("providers")
    .select("*")
    .eq("is_active", true)
    .order("rating", { ascending: false })

  return (
    <AppLayout>
      <PageHeader title="Book Services" description="Find and book professional services for your home" />
      <Container>
        <ProviderList providers={providers || []} household={household} />
      </Container>
    </AppLayout>
  )
}
