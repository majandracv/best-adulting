import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { ProviderList } from "@/components/booking/provider-list"
import { getTranslations } from "next-intl/server"

export default async function BookingPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = await createClient()
  const t = await getTranslations("booking")

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect(`/${locale}/auth/login`)
  }

  // Get user's household
  const { data: household } = await supabase.from("households").select("*").eq("owner_id", data.user.id).single()

  if (!household) {
    redirect(`/${locale}/dashboard`)
  }

  // Get providers with ratings and availability
  const { data: providers } = await supabase
    .from("providers")
    .select("*")
    .eq("is_active", true)
    .order("rating", { ascending: false })

  return (
    <AppLayout>
      <PageHeader title={t("title")} description="Find and book professional services for your home" />
      <Container>
        <ProviderList providers={providers || []} household={household} locale={locale} />
      </Container>
    </AppLayout>
  )
}
