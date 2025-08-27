import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { PriceComparisonSearch } from "@/components/shop/price-comparison-search"
import { getTranslations } from "next-intl/server"

export default async function ShopPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = await createClient()
  const t = await getTranslations("shop")

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect(`/${locale}/auth/login`)
  }

  // Get user profile to check tier
  const { data: userProfile } = await supabase.from("users_profile").select("tier").eq("id", data.user.id).single()

  const userTier = userProfile?.tier || "free"

  return (
    <AppLayout>
      <PageHeader title={t("title")} description="Compare prices and find the best deals" />
      <Container>
        <PriceComparisonSearch userTier={userTier} locale={locale} />
      </Container>
    </AppLayout>
  )
}
