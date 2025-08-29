export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { ProviderDirectory } from "@/components/booking/provider-directory"
import { getProviders } from "@/lib/actions/providers"

export default async function BookingPage({
  searchParams,
}: {
  searchParams: { service?: string; location?: string }
}) {
  const supabase = createServerClient()

  if (!supabase) {
    redirect("/auth/login")
  }

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const providers = await getProviders(searchParams.service, searchParams.location)

  return (
    <AppLayout>
      <PageHeader
        title="Book Services"
        description="Find and book trusted professionals for your home maintenance needs"
      />
      <Container>
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Service Type</label>
                <select className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground">
                  <option value="">All Services</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="hvac">HVAC</option>
                  <option value="appliance-repair">Appliance Repair</option>
                  <option value="handyman">Handyman</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="landscaping">Landscaping</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                <input
                  type="text"
                  placeholder="Enter ZIP code or city"
                  className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="flex items-end">
                <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                  Search Providers
                </button>
              </div>
            </div>
          </div>

          <ProviderDirectory providers={providers} />
        </div>
      </Container>
    </AppLayout>
  )
}
