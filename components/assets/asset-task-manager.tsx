"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Plus, Calendar, AlertTriangle, UserCheck } from "lucide-react"
import { completeTask, snoozeTask } from "@/lib/actions/tasks"
import { CompleteTaskDialog } from "@/components/tasks/complete-task-dialog"
import { TaskBookingDialog } from "@/components/tasks/task-booking-dialog"
import { getTemplatesForAsset } from "@/lib/task-templates"
import { TaskTemplateQuickAdd } from "./task-template-quick-add"
import Link from "next/link"
import { Wrench } from "lucide-react"

interface AssetTaskManagerProps {
  assetId: string
  assetName: string
  assetBrand?: string
  householdId: string
  tasks: any[]
}

export function AssetTaskManager({ assetId, assetName, assetBrand, householdId, tasks }: AssetTaskManagerProps) {
  const [completingTask, setCompletingTask] = useState<string | null>(null)
  const [bookingTask, setBookingTask] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)

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

  const suggestedTemplates = getTemplatesForAsset(assetName, assetBrand)

  if (tasks.length === 0 && suggestedTemplates.length === 0) {
    return (
      <div className="text-center py-8">
        <Wrench className="w-12 h-12 text-indigo/30 mx-auto mb-4" />
        <p className="text-indigo/60 mb-4">No maintenance tasks found for this asset</p>
        <Link href="/tasks/new">
          <Button className="bg-indigo hover:bg-indigo/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Custom Task
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Suggested Templates */}
        {suggestedTemplates.length > 0 && tasks.length === 0 && (
          <div className="border border-indigo/20 rounded-lg p-4 bg-indigo/5">
            <h4 className="font-medium text-indigo mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Suggested Maintenance Tasks
            </h4>
            <TaskTemplateQuickAdd
              templates={suggestedTemplates.slice(0, 3)}
              assetId={assetId}
              householdId={householdId}
            />
            {suggestedTemplates.length > 3 && (
              <Link href={`/tasks/templates?asset=${assetId}`}>
                <Button variant="outline" size="sm" className="mt-3 border-indigo/20 text-indigo bg-transparent">
                  View All Templates ({suggestedTemplates.length})
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Existing Tasks */}
        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task) => {
              const priority = getTaskPriority(task)
              return (
                <Card key={task.id} className="border-indigo/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-indigo truncate">{task.title}</h4>
                          <Badge className={getPriorityColor(priority)}>
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-indigo/60 mb-2">
                          {task.frequency && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{task.frequency}</span>
                            </div>
                          )}
                          {priority === "overdue" && (
                            <div className="flex items-center gap-1 text-red-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Overdue</span>
                            </div>
                          )}
                        </div>

                        {task.description && <p className="text-sm text-indigo/70 line-clamp-2">{task.description}</p>}
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
                          Book Pro
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
                          onClick={() => handleSnooze(task.id, 7)}
                          disabled={isLoading === task.id}
                          className="border-indigo/20 text-indigo hover:bg-indigo/5"
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Snooze
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-indigo/60 mb-3">No active tasks for this asset</p>
            <Link href="/tasks/new">
              <Button variant="outline" size="sm" className="border-indigo/20 text-indigo bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Task
              </Button>
            </Link>
          </div>
        )}
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
