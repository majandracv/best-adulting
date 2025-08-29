import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { getBookingsForHousehold } from "@/lib/actions/bookings"
import { BookingsList } from "@/components/booking/bookings-list"

export const dynamic = "force-dynamic"

export default async function BookingsPage() {
  const supabase = createServerClient()

  if (!supabase) {
    redirect("/auth/login")
  }

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user's household
  const { data: member } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", data.user.id)
    .single()

  if (!member) {
    redirect("/dashboard")
  }

  const bookings = await getBookingsForHousehold(member.household_id)

  return (
    <AppLayout>
      <PageHeader title="My Bookings" description="Manage your service appointments and track their progress" />
      <Container>
        <BookingsList bookings={bookings} />
      </Container>
    </AppLayout>
  )
}
