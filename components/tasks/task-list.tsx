"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Store as Snooze, Package, Calendar, Plus, UserCheck } from "lucide-react"
import { completeTask, snoozeTask } from "@/lib/actions/tasks"
import { CompleteTaskDialog } from "./complete-task-dialog"
import { TaskBookingDialog } from "./task-booking-dialog"
import Link from "next/link"

interface TaskListProps {
  tasks: any[]
}

export function TaskList({ tasks }: TaskListProps) {
  const [completingTask, setCompletingTask] = useState<string | null>(null)
  const [bookingTask, setBookingTask] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSnooze = async (taskId: string, days = 1) => {
    setIsLoading(taskId)
    try {
      await snoozeTask(taskId, days)
    } catch (error) {
      console.error("Failed to snooze task:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const handleComplete = async (taskId: string, formData: FormData) => {
    setIsLoading(taskId)
    try {
      await completeTask(taskId, formData)
      setCompletingTask(null)
    } catch (error) {
      console.error("Failed to complete task:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const getTaskPriority = (task: any) => {
    if (!task.due_date) return "none"
    const dueDate = new Date(task.due_date)
    const today = new Date()
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "overdue"
    if (diffDays === 0) return "today"
    if (diffDays <= 3) return "soon"
    return "upcoming"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "overdue":
        return "bg-red-100 text-red-700 border-red-200"
      case "today":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "soon":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "upcoming":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const groupedTasks = tasks.reduce(
    (groups, task) => {
      const priority = getTaskPriority(task)
      if (!groups[priority]) groups[priority] = []
      groups[priority].push(task)
      return groups
    },
    {} as Record<string, any[]>,
  )

  const priorityOrder = ["overdue", "today", "soon", "upcoming", "none"]
  const priorityLabels = {
    overdue: "Overdue",
    today: "Due Today",
    soon: "Due Soon",
    upcoming: "Upcoming",
    none: "No Due Date",
  }

  if (tasks.length === 0) {
    return (
      <Card className="border-indigo/10">
        <CardContent className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-indigo/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-indigo mb-2">No tasks yet</h3>
          <p className="text-indigo/60 mb-4">Create your first task to get started with household management</p>
          <div className="flex gap-2 justify-center">
            <Link href="/tasks/new">
              <Button className="bg-indigo hover:bg-indigo/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </Link>
            <Link href="/tasks/templates">
              <Button variant="outline" className="border-indigo/20 text-indigo hover:bg-indigo/5 bg-transparent">
                Browse Templates
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {priorityOrder.map((priority) => {
          const priorityTasks = groupedTasks[priority]
          if (!priorityTasks || priorityTasks.length === 0) return null

          return (
            <div key={priority}>
              <h2 className="text-lg font-semibold text-indigo mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {priorityLabels[priority as keyof typeof priorityLabels]} ({priorityTasks.length})
              </h2>
              <div className="grid gap-4">
                {priorityTasks.map((task) => (
                  <Card key={task.id} className="border-indigo/10">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-indigo truncate">{task.title}</h3>
                            <Badge className={getPriorityColor(getTaskPriority(task))}>
                              {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-indigo/60 mb-3">
                            {task.assets && (
                              <div className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                <span>{task.assets.name}</span>
                              </div>
                            )}
                            {task.frequency && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <Badge variant="outline" className="border-indigo/20 text-indigo">
                                  {task.frequency}
                                </Badge>
                              </div>
                            )}
                            {task.status && (
                              <Badge variant="outline" className="border-indigo/20 text-indigo">
                                {task.status}
                              </Badge>
                            )}
                          </div>

                          {task.description && (
                            <p className="text-sm text-indigo/70 mb-3 line-clamp-2">{task.description}</p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setBookingTask(task)}
                            disabled={isLoading === task.id}
                            className="border-primary/20 text-primary hover:bg-primary/5"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Book Service
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => setCompletingTask(task.id)}
                            disabled={isLoading === task.id}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSnooze(task.id, 1)}
                            disabled={isLoading === task.id}
                            className="border-indigo/20 text-indigo hover:bg-indigo/5"
                          >
                            <Snooze className="w-4 h-4 mr-1" />
                            Snooze
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <CompleteTaskDialog
        taskId={completingTask}
        open={!!completingTask}
        onOpenChange={(open) => !open && setCompletingTask(null)}
        onComplete={handleComplete}
        isLoading={isLoading === completingTask}
      />

      <TaskBookingDialog
        task={bookingTask}
        open={!!bookingTask}
        onOpenChange={(open) => !open && setBookingTask(null)}
      />
    </>
  )
}
