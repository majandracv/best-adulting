"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, Package, Wrench, AlertTriangle, Calendar, ExternalLink, Plus } from "lucide-react"
import { completeTask } from "@/lib/actions/tasks"
import { useState } from "react"
import Link from "next/link"

interface IntegratedTaskWidgetProps {
  tasks: any[]
  assets: any[]
}

export function IntegratedTaskWidget({ tasks, assets }: IntegratedTaskWidgetProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleQuickComplete = async (taskId: string) => {
    setIsLoading(taskId)
    try {
      const formData = new FormData()
      await completeTask(taskId, formData)
    } catch (error) {
      console.error("Failed to complete task:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date || task.status === "completed") return false
    return new Date(task.due_date) < new Date()
  })

  const upcomingTasks = tasks.filter((task) => {
    if (!task.due_date || task.status === "completed") return false
    const dueDate = new Date(task.due_date)
    const today = new Date()
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays <= 7
  })

  const assetTasks = tasks.filter((task) => task.asset_id)
  const generalTasks = tasks.filter((task) => !task.asset_id)

  const completedTasks = tasks.filter((task) => task.status === "completed").length
  const totalTasks = tasks.length || 1
  const completionRate = Math.round((completedTasks / totalTasks) * 100)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Task Management
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {completionRate}% Complete
            </Badge>
            <Link href="/tasks/templates">
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Task
              </Button>
            </Link>
          </div>
        </div>
        <Progress value={completionRate} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Critical Alerts */}
        {overdueTasks.length > 0 && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="font-medium text-destructive text-sm">
                {overdueTasks.length} Overdue Task{overdueTasks.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="space-y-2">
              {overdueTasks.slice(0, 2).map((task) => (
                <div key={task.id} className="flex items-center justify-between gap-2 p-2 bg-background rounded">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {task.asset_id && <Package className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{task.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Due {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleQuickComplete(task.id)}
                    disabled={isLoading === task.id}
                    className="h-7 px-2"
                  >
                    <CheckCircle className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Asset-Linked Tasks */}
        {assetTasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Package className="w-4 h-4" />
                Asset Maintenance ({assetTasks.length})
              </h4>
              <Link href="/assets">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </Link>
            </div>
            <div className="space-y-2">
              {assetTasks.slice(0, 3).map((task) => {
                const asset = assets.find((a) => a.id === task.asset_id)
                return (
                  <div key={task.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {asset?.name} • Due {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {task.frequency}
                    </Badge>
                    {task.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleQuickComplete(task.id)}
                        disabled={isLoading === task.id}
                        className="h-6 w-6 p-0"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Upcoming General Tasks */}
        {upcomingTasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                This Week ({upcomingTasks.length})
              </h4>
            </div>
            <div className="space-y-2">
              {upcomingTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.name}</p>
                    <p className="text-xs text-muted-foreground">Due {new Date(task.due_date).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {task.frequency}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {tasks.length === 0 && (
          <div className="text-center py-6">
            <Wrench className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">No tasks yet</p>
            <Link href="/tasks/templates">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Create First Task
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
