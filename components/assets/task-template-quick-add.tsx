"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Plus, CheckCircle } from "lucide-react"
import { createTaskFromTemplate } from "@/lib/actions/tasks"
import type { TaskTemplate } from "@/lib/task-templates"

interface TaskTemplateQuickAddProps {
  templates: TaskTemplate[]
  assetId: string
  householdId: string
}

export function TaskTemplateQuickAdd({ templates, assetId, householdId }: TaskTemplateQuickAddProps) {
  const [addingTasks, setAddingTasks] = useState<Set<string>>(new Set())
  const [addedTasks, setAddedTasks] = useState<Set<string>>(new Set())

  const handleAddTask = async (templateId: string) => {
    setAddingTasks((prev) => new Set(prev).add(templateId))

    try {
      await createTaskFromTemplate(templateId, assetId, householdId)
      setAddedTasks((prev) => new Set(prev).add(templateId))
    } catch (error) {
      console.error("Failed to create task:", error)
    } finally {
      setAddingTasks((prev) => {
        const next = new Set(prev)
        next.delete(templateId)
        return next
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="space-y-3">
      {templates.map((template) => {
        const isAdding = addingTasks.has(template.id)
        const isAdded = addedTasks.has(template.id)

        return (
          <div
            key={template.id}
            className="flex items-start justify-between gap-3 p-3 bg-white rounded-lg border border-indigo/10"
          >
            <div className="flex-1 min-w-0">
              <h5 className="font-medium text-indigo mb-1">{template.title}</h5>
              <p className="text-sm text-indigo/70 line-clamp-2 mb-2">{template.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getPriorityColor(template.priority)} variant="outline">
                  {template.priority}
                </Badge>
                <Badge variant="outline" className="border-indigo/20 text-indigo">
                  {template.frequency}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-indigo/60">
                  <Clock className="w-3 h-3" />
                  <span>~{template.estimatedTimeMin}min</span>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => handleAddTask(template.id)}
              disabled={isAdding || isAdded}
              className={
                isAdded ? "bg-green-600 hover:bg-green-700 text-white" : "bg-indigo hover:bg-indigo/90 text-white"
              }
            >
              {isAdded ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Added
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  {isAdding ? "Adding..." : "Add"}
                </>
              )}
            </Button>
          </div>
        )
      })}
    </div>
  )
}
