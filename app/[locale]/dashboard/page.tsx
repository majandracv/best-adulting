import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, CheckSquare, DollarSign, Calendar, Plus, TrendingUp, Clock, CheckCircle } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = await createClient()
  const t = await getTranslations("dashboard")

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect(`/${locale}/auth/login`)
  }

  const [
    { data: userProfile },
    { data: household },
    { data: assets },
    { data: dueTasks },
    { data: recentTasks },
    { data: monthCosts },
  ] = await Promise.all([
    supabase.from("users_profile").select("*").eq("id", data.user.id).single(),
    supabase.from("households").select("*").eq("owner_id", data.user.id).single(),
    supabase.from("assets").select("*").limit(100),
    supabase
      .from("tasks")
      .select("*, assets(name)")
      .lte("next_due", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
      .eq("is_archived", false)
      .order("next_due", { ascending: true })
      .limit(5),
    supabase
      .from("task_logs")
      .select("*, tasks(title), users_profile(full_name)")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("costs")
      .select("amount_cents, currency")
      .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ])

  const quickActions = [
    {
      title: t("quickActions.addAsset.title"),
      description: t("quickActions.addAsset.description"),
      icon: Package,
      href: `/${locale}/assets/new`,
      color: "bg-lime/10 text-lime-700",
    },
    {
      title: t("quickActions.createTask.title"),
      description: t("quickActions.createTask.description"),
      icon: CheckSquare,
      href: `/${locale}/tasks/new`,
      color: "bg-aqua/10 text-aqua-700",
    },
    {
      title: t("quickActions.comparePrices.title"),
      description: t("quickActions.comparePrices.description"),
      icon: DollarSign,
      href: `/${locale}/shop`,
      color: "bg-lemon/10 text-yellow-700",
    },
    {
      title: t("quickActions.bookPro.title"),
      description: t("quickActions.bookPro.description"),
      icon: Calendar,
      href: `/${locale}/booking`,
      color: "bg-peach/10 text-orange-700",
    },
  ]

  const totalSpending = monthCosts?.reduce((sum, cost) => sum + cost.amount_cents, 0) || 0
  const stats = [
    {
      label: t("stats.assetsTracked"),
      value: assets?.length.toString() || "0",
      change: "+0%",
    },
    {
      label: t("stats.tasksPending"),
      value: dueTasks?.length.toString() || "0",
      change: "+0%",
    },
    {
      label: t("stats.moneySaved"),
      value: `$${(totalSpending / 100).toFixed(2)}`,
      change: "+0%",
    },
  ]

  return (
    <AppLayout>
      <PageHeader
        title={t("welcome")}
        description={t("description")}
        action={
          <Button className="bg-indigo hover:bg-indigo/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            {t("quickAdd")}
          </Button>
        }
      />

      <Container>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-indigo/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-indigo/70">{stat.label}</p>
                    <p className="text-2xl font-bold text-indigo">{stat.value}</p>
                  </div>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {stat.change}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Due This Week */}
          <Card className="border-indigo/10">
            <CardHeader>
              <CardTitle className="text-indigo flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {t("dueThisWeek")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dueTasks && dueTasks.length > 0 ? (
                <div className="space-y-3">
                  {dueTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-indigo/5 rounded-lg">
                      <div>
                        <p className="font-medium text-indigo text-sm">{task.title}</p>
                        <p className="text-xs text-indigo/60">
                          {task.assets?.name} • Due {new Date(task.next_due).toLocaleDateString()}
                        </p>
                      </div>
                      <CheckSquare className="w-4 h-4 text-indigo/40" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-indigo/60 text-sm">{t("recentActivity.noActivity")}</p>
              )}
            </CardContent>
          </Card>

          {/* Recently Done */}
          <Card className="border-indigo/10">
            <CardHeader>
              <CardTitle className="text-indigo flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {t("recentlyDone")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentTasks && recentTasks.length > 0 ? (
                <div className="space-y-3">
                  {recentTasks.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-700 text-sm">{log.tasks?.title}</p>
                        <p className="text-xs text-green-600">
                          {log.users_profile?.full_name} • {new Date(log.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-indigo/60 text-sm">{t("recentActivity.noActivity")}</p>
              )}
            </CardContent>
          </Card>

          {/* Spending This Month */}
          <Card className="border-indigo/10">
            <CardHeader>
              <CardTitle className="text-indigo flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                {t("spendingThisMonth")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-indigo">${(totalSpending / 100).toFixed(2)}</p>
                <p className="text-sm text-indigo/60 mt-1">{monthCosts?.length || 0} transactions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-indigo mb-4">{t("quickActions.title")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Card key={action.title} className="border-indigo/10 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div
                      className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mx-auto mb-3`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-indigo text-sm mb-1">{action.title}</h3>
                    <p className="text-xs text-indigo/70">{action.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </Container>
    </AppLayout>
  )
}
