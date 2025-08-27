import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppLayout } from "@/components/layout/app-layout"
import { PageHeader } from "@/components/layout/page-header"
import { Container } from "@/components/layout/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, CheckSquare, DollarSign, Calendar, Plus, TrendingUp } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const quickActions = [
    {
      title: "Add Asset",
      description: "Scan or add a new household item",
      icon: Package,
      href: "/assets/add",
      color: "bg-lime/10 text-lime-700",
    },
    {
      title: "Create Task",
      description: "Schedule maintenance or chores",
      icon: CheckSquare,
      href: "/tasks/add",
      color: "bg-aqua/10 text-aqua-700",
    },
    {
      title: "Compare Prices",
      description: "Find the best deals",
      icon: DollarSign,
      href: "/compare",
      color: "bg-lemon/10 text-yellow-700",
    },
    {
      title: "Book Pro",
      description: "Schedule professional help",
      icon: Calendar,
      href: "/booking",
      color: "bg-peach/10 text-orange-700",
    },
  ]

  const stats = [
    { label: "Assets Tracked", value: "0", change: "+0%" },
    { label: "Tasks Pending", value: "0", change: "+0%" },
    { label: "Money Saved", value: "$0", change: "+0%" },
  ]

  return (
    <AppLayout>
      <PageHeader
        title={`Welcome back!`}
        description="Here's what's happening with your household"
        action={
          <Button className="bg-indigo hover:bg-indigo/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Quick Add
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

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-indigo mb-4">Quick Actions</h2>
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

        {/* Recent Activity */}
        <Card className="border-indigo/10">
          <CardHeader>
            <CardTitle className="text-indigo">Recent Activity</CardTitle>
            <CardDescription>Your latest household updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-indigo/30 mx-auto mb-4" />
              <p className="text-indigo/70 mb-4">No activity yet</p>
              <p className="text-sm text-indigo/50">Start by adding your first asset or creating a task</p>
            </div>
          </CardContent>
        </Card>
      </Container>
    </AppLayout>
  )
}
