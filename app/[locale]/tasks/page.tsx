import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { TaskList } from "@/components/tasks/task-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getTranslations } from "next-intl/server"
import Link from "next/link"

export default async function TasksPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = await createClient()
  const t = await getTranslations("tasks")

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect(`/${locale}/auth/login`)
  }

  // Get user's household
  const { data: household } = await supabase.from("households").select("*").eq("owner_id", data.user.id).single()

  if (!household) {
    redirect(`/${locale}/dashboard`)
  }

  // Get tasks with related data
  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      *,
      assets(name, type),
      users_profile!tasks_assigned_to_fkey(full_name)
    `)
    .eq("household_id", household.id)
    .eq("is_archived", false)
    .order("next_due", { ascending: true, nullsLast: true })

  return (
    <AppLayout>
      <PageHeader
        title={t("title")}
        description="Manage your household tasks and maintenance"
        action={
          <Link href={`/${locale}/tasks/new`}>
            <Button className="bg-indigo hover:bg-indigo/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </Link>
        }
      />
      <Container>
        <TaskList tasks={tasks || []} locale={locale} />
      </Container>
    </AppLayout>
  )
}
