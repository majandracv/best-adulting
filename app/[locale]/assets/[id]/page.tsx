import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, DollarSign, Wrench, Edit } from "lucide-react"
import { getTranslations } from "next-intl/server"
import Image from "next/image"

export default async function AssetDetailsPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string }
}) {
  const supabase = await createClient()
  const t = await getTranslations("assets.details")

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect(`/${locale}/auth/login`)
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

  // Get related tasks and costs
  const [{ data: tasks }, { data: costs }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("asset_id", id)
      .eq("is_archived", false)
      .order("next_due", { ascending: true }),
    supabase.from("costs").select("*").eq("linked_task_id", id).order("created_at", { ascending: false }),
  ])

  return (
    <AppLayout>
      <PageHeader
        title={asset.name}
        description={`${asset.brand || ""} ${asset.model || ""}`.trim() || "Asset details"}
        action={
          <Button variant="outline" className="border-indigo text-indigo hover:bg-indigo/5 bg-transparent">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
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
                    <p className="text-sm text-indigo/70">Type</p>
                    <p className="font-medium text-indigo">{asset.type || "Not specified"}</p>
                  </div>
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
                  {asset.serial && (
                    <div className="col-span-2">
                      <p className="text-sm text-indigo/70">Serial Number</p>
                      <p className="font-medium text-indigo font-mono">{asset.serial}</p>
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

            {/* Related Tasks */}
            <Card className="border-indigo/10">
              <CardHeader>
                <CardTitle className="text-indigo flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  {t("relatedTasks")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasks && tasks.length > 0 ? (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-indigo/5 rounded-lg">
                        <div>
                          <p className="font-medium text-indigo">{task.title}</p>
                          <p className="text-sm text-indigo/60">
                            {task.next_due ? `Due ${new Date(task.next_due).toLocaleDateString()}` : "No due date"}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-indigo/20 text-indigo">
                          {task.frequency_type || "One-time"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-indigo/60">{t("noTasks")}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cost Log */}
          <div>
            <Card className="border-indigo/10">
              <CardHeader>
                <CardTitle className="text-indigo flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  {t("costLog")}
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
                  <p className="text-indigo/60">{t("noCosts")}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </AppLayout>
  )
}
