import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { Container } from "@/components/layout/container"
import { getProvider } from "@/lib/actions/providers"
import { ProviderProfile } from "@/components/booking/provider-profile"
import { BookingForm } from "@/components/booking/booking-form"
import { notFound } from "next/navigation"

export default async function ProviderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const provider = await getProvider(params.id)
  if (!provider) {
    notFound()
  }

  return (
    <AppLayout>
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ProviderProfile provider={provider} />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <BookingForm provider={provider} />
            </div>
          </div>
        </div>
      </Container>
    </AppLayout>
  )
}
