"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Lightbulb,
  TrendingUp,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Package,
  Users,
  Target,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

interface SmartInsightsWidgetProps {
  assets: any[]
  tasks: any[]
  bookings: any[]
  savings: any[]
  priceAlerts: any[]
  costs: any[]
}

export function SmartInsightsWidget({
  assets,
  tasks,
  bookings,
  savings,
  priceAlerts,
  costs,
}: SmartInsightsWidgetProps) {
  // Generate smart insights based on user data
  const generateInsights = () => {
    const insights = []

    // Asset maintenance insights
    const oldAssets = assets.filter((asset) => {
      const createdDate = new Date(asset.created_at)
      const monthsOld = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      return monthsOld > 12 && !tasks.some((task) => task.asset_id === asset.id)
    })

    if (oldAssets.length > 0) {
      insights.push({
        type: "maintenance",
        priority: "high",
        title: "Assets Need Maintenance Tasks",
        description: `${oldAssets.length} assets haven't had maintenance tasks created yet`,
        action: "Create maintenance schedules",
        actionUrl: "/tasks/templates",
        icon: Package,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
      })
    }

    // Task completion insights
    const overdueTasks = tasks.filter((task) => {
      if (!task.due_date || task.status === "completed") return false
      return new Date(task.due_date) < new Date()
    })

    if (overdueTasks.length > 3) {
      insights.push({
        type: "productivity",
        priority: "high",
        title: "Task Backlog Building Up",
        description: `${overdueTasks.length} overdue tasks may indicate scheduling issues`,
        action: "Review task schedule",
        actionUrl: "/tasks",
        icon: AlertTriangle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      })
    }

    // Spending insights
    const monthlySpending = costs.reduce((sum, cost) => sum + cost.amount_cents / 100, 0)
    const avgSpending = monthlySpending / Math.max(1, costs.length)

    if (monthlySpending > 500) {
      insights.push({
        type: "financial",
        priority: "medium",
        title: "High Monthly Spending Detected",
        description: `$${monthlySpending.toFixed(0)} spent this month. Consider price tracking`,
        action: "Set up price alerts",
        actionUrl: "/price-compare",
        icon: DollarSign,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      })
    }

    // Savings opportunities
    const totalSavings = savings.reduce((sum, saving) => sum + saving.amount_saved, 0)
    const activePriceAlerts = priceAlerts.filter((alert) => alert.is_active).length

    if (totalSavings > 50 && activePriceAlerts < 3) {
      insights.push({
        type: "savings",
        priority: "medium",
        title: "Expand Price Tracking",
        description: `You've saved $${totalSavings.toFixed(0)}. Track more items for bigger savings`,
        action: "Add more price alerts",
        actionUrl: "/price-compare",
        icon: Target,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      })
    }

    // Booking insights
    const recentBookings = bookings.filter((booking) => {
      const bookingDate = new Date(booking.scheduled_date)
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
      return bookingDate >= threeMonthsAgo
    })

    if (recentBookings.length === 0 && tasks.length > 5) {
      insights.push({
        type: "service",
        priority: "low",
        title: "Consider Professional Help",
        description: "Many tasks could be handled by professional services",
        action: "Browse service providers",
        actionUrl: "/booking",
        icon: Users,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
      })
    }

    // Seasonal insights
    const currentMonth = new Date().getMonth()
    const seasonalTasks = {
      0: "Winter maintenance: Check heating system, seal drafts",
      1: "Late winter: Plan spring cleaning, HVAC filter change",
      2: "Spring prep: Gutter cleaning, exterior inspection",
      3: "Spring maintenance: Garden prep, AC system check",
      4: "Late spring: Deep cleaning, appliance maintenance",
      5: "Summer prep: AC maintenance, outdoor equipment check",
      6: "Mid-summer: Pool maintenance, cooling system optimization",
      7: "Late summer: Prepare for fall, check insulation",
      8: "Fall prep: Heating system check, weatherproofing",
      9: "Autumn maintenance: Gutter cleaning, leaf removal",
      10: "Winter prep: Heating system, pipe insulation",
      11: "Holiday prep: Safety checks, emergency supplies",
    }

    insights.push({
      type: "seasonal",
      priority: "low",
      title: "Seasonal Maintenance Reminder",
      description: seasonalTasks[currentMonth],
      action: "View seasonal tasks",
      actionUrl: "/tasks/templates",
      icon: Calendar,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
    })

    // Efficiency insights
    const completedTasks = tasks.filter((task) => task.status === "completed").length
    const totalTasks = tasks.length || 1
    const completionRate = (completedTasks / totalTasks) * 100

    if (completionRate > 80) {
      insights.push({
        type: "achievement",
        priority: "low",
        title: "Excellent Task Management!",
        description: `${completionRate.toFixed(0)}% completion rate. You're staying on top of things`,
        action: "Keep up the great work",
        actionUrl: "/tasks",
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      })
    }

    return insights
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
      .slice(0, 4)
  }

  const insights = generateInsights()

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="destructive" className="text-xs">
            High Priority
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="secondary" className="text-xs">
            Medium
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="text-xs">
            Low Priority
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            Info
          </Badge>
        )
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Smart Insights
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {insights.length} Recommendations
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon
          return (
            <div key={index} className={`p-3 rounded-lg border ${insight.bgColor} ${insight.borderColor}`}>
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${insight.color} mt-0.5 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{insight.title}</h4>
                    {getPriorityBadge(insight.priority)}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{insight.description}</p>
                  <Link href={insight.actionUrl}>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`h-7 text-xs ${insight.bgColor} ${insight.borderColor} ${insight.color} hover:opacity-80`}
                    >
                      {insight.action}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )
        })}

        {insights.length === 0 && (
          <div className="text-center py-6">
            <Lightbulb className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No insights available yet. Add more data to get personalized recommendations.
            </p>
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Insights updated daily</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>AI-powered recommendations</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
