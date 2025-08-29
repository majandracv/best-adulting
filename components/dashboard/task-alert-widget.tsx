"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Calendar, CheckCircle, Clock } from "lucide-react"
import { completeTask, snoozeTask } from "@/lib/actions/tasks"
import { useState } from "react"
import Link from "next/link"

interface TaskAlertWidgetProps {
  overdueTasks: any[]
  upcomingTasks: any[]
}

export function TaskAlertWidget({ overdueTasks, upcomingTasks }: TaskAlertWidgetProps) {
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

  const handleQuickSnooze = async (taskId: string) => {
    setIsLoading(taskId)
    try {
      await snoozeTask(taskId, 1)
    } catch (error) {
      console.error("Failed to snooze task:", error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Overdue Tasks ({overdueTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueTasks.slice(0, 2).map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-red-700 truncate">{task.title}</p>
                  <p className="text-sm text-red-600">Due {new Date(task.due_date).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleQuickComplete(task.id)}
                    disabled={isLoading === task.id}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickSnooze(task.id)}
                    disabled={isLoading === task.id}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Clock className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {overdueTasks.length > 2 && (
              <Link href="/tasks">
                <Button variant="outline" size="sm" className="w-full border-red-200 text-red-600 bg-white">
                  View All Overdue Tasks ({overdueTasks.length})
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-700 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Due This Week ({upcomingTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.slice(0, 2).map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-yellow-700 truncate">{task.title}</p>
                  <p className="text-sm text-yellow-600">Due {new Date(task.due_date).toLocaleDateString()}</p>
                </div>
                <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                  {task.frequency || "One-time"}
                </Badge>
              </div>
            ))}
            {upcomingTasks.length > 2 && (
              <Link href="/tasks">
                <Button variant="outline" size="sm" className="w-full border-yellow-200 text-yellow-600 bg-white">
                  View All Upcoming Tasks ({upcomingTasks.length})
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
