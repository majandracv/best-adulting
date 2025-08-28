import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { TaskList } from "@/components/tasks/task-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function TasksPage() {
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

  // Declare tasks variable
  const tasks = []

  return (
    <AppLayout>
      <PageHeader
        title="Tasks"
        description="Manage your household tasks and maintenance"
        action={
          <Link href="/tasks/new">
            <Button className="bg-indigo hover:bg-indigo/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </Link>
        }
      />
      <Container>
        <TaskList tasks={tasks || []} />
      </Container>
    </AppLayout>
  )
}
