import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { Container } from "@/components/layout/container"
import { getBooking } from "@/lib/actions/bookings"
import { BookingDetail } from "@/components/booking/booking-detail"
import { notFound } from "next/navigation"

export default async function BookingDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const booking = await getBooking(params.id)
  if (!booking) {
    notFound()
  }

  return (
    <AppLayout>
      <Container>
        <BookingDetail booking={booking} />
      </Container>
    </AppLayout>
  )
}
