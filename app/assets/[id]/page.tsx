import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, DollarSign, Wrench, Edit, Plus, Calendar, AlertTriangle } from "lucide-react"
import { AssetTaskManager } from "@/components/assets/asset-task-manager"
import Image from "next/image"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AssetDetailsPage({
  params: { id },
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get asset with related data
  const { data: asset, error: assetError } = await supabase
    .from("assets")
    .select(`
      *,
      rooms(name),
      households(name)
    `)
    .eq("id", id)
    .single()

  if (assetError || !asset) {
    notFound()
  }

  const [{ data: tasks }, { data: costs }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("asset_id", id)
      .neq("status", "archived")
      .order("due_date", { ascending: true }),
    supabase.from("costs").select("*").eq("linked_task_id", id).order("created_at", { ascending: false }),
  ])

  const overdueTasks =
    tasks?.filter((task) => {
      if (!task.due_date) return false
      return new Date(task.due_date) < new Date()
    }).length || 0

  const upcomingTasks =
    tasks?.filter((task) => {
      if (!task.due_date) return false
      const dueDate = new Date(task.due_date)
      const today = new Date()
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays >= 0 && diffDays <= 7
    }).length || 0

  return (
    <AppLayout>
      <PageHeader
        title={asset.name}
        description={`${asset.brand || ""} ${asset.model || ""}`.trim() || "Asset details"}
        action={
          <div className="flex gap-2">
            <Link href={`/tasks/templates?asset=${id}`}>
              <Button className="bg-indigo hover:bg-indigo/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Tasks
              </Button>
            </Link>
            <Button variant="outline" className="border-indigo text-indigo hover:bg-indigo/5 bg-transparent">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        }
      />
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Asset Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-indigo/10">
              <CardHeader>
                <CardTitle className="text-indigo flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Asset Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {asset.photo_url && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                    <Image src={asset.photo_url || "/placeholder.svg"} alt={asset.name} fill className="object-cover" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-indigo/70">Room</p>
                    <p className="font-medium text-indigo">{asset.rooms?.name || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-indigo/70">Brand</p>
                    <p className="font-medium text-indigo">{asset.brand || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-indigo/70">Model</p>
                    <p className="font-medium text-indigo">{asset.model || "Not specified"}</p>
                  </div>
                  {asset.serial_number && (
                    <div>
                      <p className="text-sm text-indigo/70">Serial Number</p>
                      <p className="font-medium text-indigo font-mono">{asset.serial_number}</p>
                    </div>
                  )}
                  {asset.purchase_date && (
                    <div>
                      <p className="text-sm text-indigo/70">Purchase Date</p>
                      <p className="font-medium text-indigo">{new Date(asset.purchase_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {asset.warranty_expiry && (
                    <div>
                      <p className="text-sm text-indigo/70">Warranty Expires</p>
                      <p className="font-medium text-indigo">{new Date(asset.warranty_expiry).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-indigo/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-indigo flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    Maintenance Tasks
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {overdueTasks > 0 && (
                      <Badge className="bg-red-100 text-red-700 border-red-200">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {overdueTasks} overdue
                      </Badge>
                    )}
                    {upcomingTasks > 0 && (
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                        <Calendar className="w-3 h-3 mr-1" />
                        {upcomingTasks} upcoming
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <AssetTaskManager
                  assetId={id}
                  assetName={asset.name}
                  assetBrand={asset.brand}
                  householdId={asset.household_id}
                  tasks={tasks || []}
                />
              </CardContent>
            </Card>
          </div>

          {/* Cost Log */}
          <div>
            <Card className="border-indigo/10">
              <CardHeader>
                <CardTitle className="text-indigo flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Cost Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                {costs && costs.length > 0 ? (
                  <div className="space-y-3">
                    {costs.map((cost) => (
                      <div key={cost.id} className="p-3 bg-indigo/5 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-indigo">${(cost.amount_cents / 100).toFixed(2)}</p>
                          <p className="text-xs text-indigo/60">{new Date(cost.created_at).toLocaleDateString()}</p>
                        </div>
                        <p className="text-sm text-indigo/70">{cost.category || "General"}</p>
                        {cost.vendor && <p className="text-xs text-indigo/60">{cost.vendor}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-indigo/60">No costs recorded for this asset</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </AppLayout>
  )
}
