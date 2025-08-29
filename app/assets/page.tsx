import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, AlertTriangle, Calendar, MapPin } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AssetsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user's household
  const { data: household } = await supabase.from("households").select("*").eq("id", data.user.id).single()

  if (!household) {
    redirect("/dashboard")
  }

  // Get assets with task counts
  const { data: assets } = await supabase
    .from("assets")
    .select(`
      *,
      rooms(name),
      tasks!inner(id, due_date, status)
    `)
    .eq("household_id", household.id)
    .order("created_at", { ascending: false })

  const assetsWithTaskStats =
    assets?.map((asset) => {
      const tasks = asset.tasks || []
      const overdueTasks = tasks.filter((task) => {
        if (!task.due_date || task.status === "completed") return false
        return new Date(task.due_date) < new Date()
      }).length

      const upcomingTasks = tasks.filter((task) => {
        if (!task.due_date || task.status === "completed") return false
        const dueDate = new Date(task.due_date)
        const today = new Date()
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return diffDays >= 0 && diffDays <= 7
      }).length

      return {
        ...asset,
        overdueTasks,
        upcomingTasks,
        totalActiveTasks: tasks.filter((task) => task.status !== "completed").length,
      }
    }) || []

  return (
    <AppLayout>
      <PageHeader
        title="Assets"
        description="Manage your household assets and maintenance schedules"
        action={
          <Link href="/assets/new">
            <Button className="bg-indigo hover:bg-indigo/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </Link>
        }
      />
      <Container>
        {assetsWithTaskStats.length === 0 ? (
          <Card className="border-indigo/10">
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 text-indigo/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-indigo mb-2">No assets yet</h3>
              <p className="text-indigo/60 mb-4">Start by adding your first household asset</p>
              <Link href="/assets/new">
                <Button className="bg-indigo hover:bg-indigo/90 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Asset
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {assetsWithTaskStats.map((asset) => (
              <Link key={asset.id} href={`/assets/${asset.id}`}>
                <Card className="border-indigo/10 hover:border-indigo/30 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-indigo truncate">{asset.name}</h3>
                        <p className="text-sm text-indigo/70">
                          {asset.brand} {asset.model}
                        </p>
                      </div>
                      <Package className="w-5 h-5 text-indigo/40 flex-shrink-0" />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-indigo/60 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{asset.rooms?.name || "Unknown room"}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {asset.overdueTasks > 0 && (
                        <Badge className="bg-red-100 text-red-700 border-red-200">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          {asset.overdueTasks} overdue
                        </Badge>
                      )}
                      {asset.upcomingTasks > 0 && (
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                          <Calendar className="w-3 h-3 mr-1" />
                          {asset.upcomingTasks} upcoming
                        </Badge>
                      )}
                      {asset.totalActiveTasks === 0 && (
                        <Badge variant="outline" className="border-indigo/20 text-indigo">
                          No active tasks
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </AppLayout>
  )
}
