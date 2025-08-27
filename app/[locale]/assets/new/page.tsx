import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { AssetForm } from "@/components/assets/asset-form"
import { getTranslations } from "next-intl/server"

export default async function NewAssetPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = await createClient()
  const t = await getTranslations("assets.new")

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect(`/${locale}/auth/login`)
  }

  // Get user's household and rooms
  const [{ data: household }, { data: rooms }] = await Promise.all([
    supabase.from("households").select("*").eq("owner_id", data.user.id).single(),
    supabase.from("rooms").select("*").order("name"),
  ])

  if (!household) {
    redirect(`/${locale}/dashboard`)
  }

  return (
    <AppLayout>
      <PageHeader title={t("title")} description={t("description")} />
      <Container size="md">
        <AssetForm household={household} rooms={rooms || []} locale={locale} />
      </Container>
    </AppLayout>
  )
}
