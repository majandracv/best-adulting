"use client"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/auth-helpers-nextjs"
import { AppLayout } from "@/components/layout/app-layout"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Package,
  CheckSquare,
  DollarSign,
  Calendar,
  Plus,
  TrendingUp,
  AlertTriangle,
  Users,
  Home,
  Camera,
  Search,
  Star,
} from "lucide-react"
import Link from "next/link"
import { IntegratedTaskWidget } from "@/components/dashboard/integrated-task-widget"
import { IntegratedAssetWidget } from "@/components/dashboard/integrated-asset-widget"
import { BookingStatusWidget } from "@/components/dashboard/booking-status-widget"
import { PriceTrackingWidget } from "@/components/dashboard/price-tracking-widget"
import { SmartInsightsWidget } from "@/components/dashboard/smart-insights-widget"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  console.log("[v0] Dashboard loading - checking authentication")

  const debugInfo = {
    timestamp: new Date().toISOString(),
    status: "Loading dashboard...",
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: () => cookieStore },
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login")
  }

  const user = session.user
  console.log("[v0] User authenticated, fetching dashboard data for user:", user.id)

  let household, assets, tasks, costs, bookings, priceAlerts, savings

  try {
    const [
      { data: householdData },
      { data: assetsData },
      { data: tasksData },
      { data: costsData },
      { data: bookingsData },
      { data: priceAlertsData },
      { data: savingsData },
    ] = await Promise.all([
      supabase.from("households").select("*").eq("id", user.id).single(),
      supabase.from("assets").select("*").eq("household_id", user.id),
      supabase.from("tasks").select("*").eq("household_id", user.id).neq("status", "archived"),
      supabase
        .from("costs")
        .select("*")
        .eq("household_id", user.id)
        .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from("bookings").select("*, providers(name)").eq("household_id", user.id).limit(10),
      supabase.from("price_alerts").select("*").eq("user_id", user.id).limit(10),
      supabase.from("savings_records").select("*").eq("user_id", user.id).limit(10),
    ])

    household = householdData
    assets = assetsData
    tasks = tasksData
    costs = costsData
    bookings = bookingsData
    priceAlerts = priceAlertsData
    savings = savingsData

    console.log("[v0] Dashboard data fetched:", {
      household: !!household,
      assets: assets?.length || 0,
      tasks: tasks?.length || 0,
      costs: costs?.length || 0,
      bookings: bookings?.length || 0,
      priceAlerts: priceAlerts?.length || 0,
      savings: savings?.length || 0,
    })

    if (!household) {
      console.log("[v0] No household found, creating default household")
      const { data: newHousehold } = await supabase
        .from("households")
        .insert({
          id: user.id,
          name: `${user.user_metadata?.full_name || user.email}'s Household`,
          plan_tier: "free",
          home_type: "house",
        })
        .select()
        .single()

      household = newHousehold || {
        id: user.id,
        name: "Your Household",
        plan_tier: "free",
        home_type: "house",
      }
    }
  } catch (error) {
    console.error("[v0] Dashboard error:", error)
    return (
      <AppLayout>
        <PageHeader title="Dashboard" description="Your household management overview" />
        <Container>
          <Card className="border-yellow-200 bg-yellow-50 mb-4">
            <CardContent className="p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Debug Info</h3>
              <p className="text-sm text-yellow-700">Error occurred: {error?.message || "Unknown error"}</p>
              <p className="text-xs text-yellow-600">Time: {debugInfo.timestamp}</p>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h3 className="font-semibold text-destructive mb-2">Unable to Load Dashboard</h3>
              <p className="text-sm text-muted-foreground mb-4">
                There was an issue connecting to the database. Please try refreshing the page.
              </p>
              <Button onClick={() => window.location.reload()}>Refresh Page</Button>
            </CardContent>
          </Card>
        </Container>
      </AppLayout>
    )
  }

  console.log("[v0] Dashboard rendering with data")

  const overdueTasks =
    tasks?.filter((task) => {
      if (!task.due_date || task.status === "completed") return false
      return new Date(task.due_date) < new Date()
    }) || []

  const upcomingTasks =
    tasks?.filter((task) => {
      if (!task.due_date || task.status === "completed") return false
      const dueDate = new Date(task.due_date)
      const today = new Date()
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays >= 0 && diffDays <= 7
    }) || []

  const pendingTasks = tasks?.filter((task) => task.status === "pending").length || 0
  const completedTasks = tasks?.filter((task) => task.status === "completed").length || 0
  const monthlySpending = costs?.reduce((sum, cost) => sum + cost.amount_cents / 100, 0) || 0
  const totalAssetValue = assets?.reduce((sum, asset) => sum + (asset.purchase_price || 0), 0) || 0
  const activeBookings = bookings?.filter((booking) => booking.status === "confirmed").length || 0
  const activeAlerts = priceAlerts?.length || 0

  const totalTasks = pendingTasks + completedTasks || 1
  const completionRate = Math.round((completedTasks / totalTasks) * 100)

  return (
    <AppLayout>
      <div className="bg-green-50 border-b border-green-200 p-2">
        <Container>
          <div className="text-xs text-green-700">
            ✅ Dashboard loaded successfully • User: {user.email} • Time: {debugInfo.timestamp}
          </div>
        </Container>
      </div>

      <PageHeader
        title={`Welcome back, ${user.user_metadata?.full_name?.split(" ")[0] || "there"}!`}
        description="Your household management overview"
        action={
          <div className="flex gap-2">
            <Link href="/assets/new/camera">
              <Button variant="outline" size="sm">
                <Camera className="w-4 h-4 mr-2" />
                Scan Asset
              </Button>
            </Link>
            <Link href="/assets/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            </Link>
          </div>
        }
      />

      <Container>
        {(overdueTasks.length > 0 || upcomingTasks.length > 0) && (
          <div className="mb-6">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-destructive mb-1">Action Required</h3>
                    <div className="space-y-1 text-sm">
                      {overdueTasks.length > 0 && (
                        <p>
                          {overdueTasks.length} overdue task{overdueTasks.length > 1 ? "s" : ""}
                        </p>
                      )}
                      {upcomingTasks.length > 0 && (
                        <p>
                          {upcomingTasks.length} task{upcomingTasks.length > 1 ? "s" : ""} due this week
                        </p>
                      )}
                    </div>
                  </div>
                  <Link href="/tasks">
                    <Button size="sm" variant="destructive">
                      View Tasks
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-5 h-5 text-muted-foreground" />
                <Badge variant="secondary">{assets?.length || 0}</Badge>
              </div>
              <p className="text-sm font-medium">Assets Tracked</p>
              <p className="text-xs text-muted-foreground">${totalAssetValue.toLocaleString()} total value</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckSquare className="w-5 h-5 text-muted-foreground" />
                <Badge variant={completionRate >= 80 ? "default" : "secondary"}>{completionRate}%</Badge>
              </div>
              <p className="text-sm font-medium">Task Progress</p>
              <Progress value={completionRate} className="h-1 mt-1" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <Badge variant="outline">${monthlySpending.toFixed(0)}</Badge>
              </div>
              <p className="text-sm font-medium">Monthly Spending</p>
              <p className="text-xs text-muted-foreground">{activeAlerts} price alerts active</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <Badge variant={activeBookings > 0 ? "default" : "secondary"}>{activeBookings}</Badge>
              </div>
              <p className="text-sm font-medium">Active Bookings</p>
              <p className="text-xs text-muted-foreground">Professional services</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <IntegratedTaskWidget tasks={tasks || []} assets={assets || []} />
          <IntegratedAssetWidget assets={assets || []} tasks={tasks || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <BookingStatusWidget bookings={bookings || []} />
          <PriceTrackingWidget priceAlerts={priceAlerts || []} savings={savings || []} />
        </div>

        <div className="mb-6">
          <SmartInsightsWidget
            assets={assets || []}
            tasks={tasks || []}
            bookings={bookings || []}
            savings={savings || []}
            priceAlerts={priceAlerts || []}
            costs={costs || []}
          />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common household management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/assets/new/camera">
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
                  <Camera className="w-6 h-6" />
                  <span className="text-sm">Scan Asset</span>
                </Button>
              </Link>
              <Link href="/tasks/templates">
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
                  <CheckSquare className="w-6 h-6" />
                  <span className="text-sm">Add Task</span>
                </Button>
              </Link>
              <Link href="/price-compare">
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
                  <Search className="w-6 h-6" />
                  <span className="text-sm">Compare Prices</span>
                </Button>
              </Link>
              <Link href="/booking">
                <Button variant="outline" className="h-auto p-4 flex flex-col gap-2 bg-transparent">
                  <Users className="w-6 h-6" />
                  <span className="text-sm">Book Service</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Household Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Household Type</span>
                  </div>
                  <Badge variant="outline">{household.home_type || "Not set"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Plan</span>
                  </div>
                  <Badge>{household.plan_tier || "Free"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">This Month</span>
                  </div>
                  <span className="text-sm font-medium">{completedTasks} tasks completed</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bookings?.slice(0, 2).map((booking) => (
                  <div key={booking.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{booking.service_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.providers?.name} • {new Date(booking.scheduled_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={booking.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                      {booking.status}
                    </Badge>
                  </div>
                ))}
                {(!bookings || bookings.length === 0) && (
                  <div className="text-center py-4">
                    <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No recent bookings</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </AppLayout>
  )
}
