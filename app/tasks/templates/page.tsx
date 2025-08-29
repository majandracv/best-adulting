import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { TaskTemplateGrid } from "@/components/tasks/task-template-grid"
import { TASK_TEMPLATES } from "@/lib/task-templates"

export default async function TaskTemplatesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user's household and assets
  const { data: household } = await supabase.from("households").select("*").eq("id", data.user.id).single()

  const { data: assets } = await supabase.from("assets").select("*").eq("household_id", household?.id)

  return (
    <AppLayout>
      <PageHeader title="Task Templates" description="Choose from pre-built maintenance tasks for your assets" />
      <Container>
        <TaskTemplateGrid templates={TASK_TEMPLATES} assets={assets || []} householdId={household?.id} />
      </Container>
    </AppLayout>
  )
}
