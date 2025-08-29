"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Wrench, AlertTriangle, CheckCircle } from "lucide-react"
import { createTaskFromTemplate } from "@/lib/actions/tasks"
import type { TaskTemplate } from "@/lib/task-templates"

interface TaskTemplateGridProps {
  templates: TaskTemplate[]
  assets: any[]
  householdId: string
}

export function TaskTemplateGrid({ templates, assets, householdId }: TaskTemplateGridProps) {
  const [selectedAssets, setSelectedAssets] = useState<Record<string, string>>({})
  const [creatingTasks, setCreatingTasks] = useState<Set<string>>(new Set())

  const handleCreateTask = async (templateId: string) => {
    const assetId = selectedAssets[templateId]
    if (!assetId) return

    setCreatingTasks((prev) => new Set(prev).add(templateId))

    try {
      await createTaskFromTemplate(templateId, assetId, householdId)
    } catch (error) {
      console.error("Failed to create task:", error)
    } finally {
      setCreatingTasks((prev) => {
        const next = new Set(prev)
        next.delete(templateId)
        return next
      })
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "medium":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "low":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
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

  const getCompatibleAssets = (template: TaskTemplate) => {
    return assets.filter((asset) =>
      template.assetTypes.some(
        (assetType) =>
          asset.name?.toLowerCase().includes(assetType.toLowerCase()) ||
          asset.brand?.toLowerCase().includes(assetType.toLowerCase()) ||
          assetType.toLowerCase().includes(asset.name?.toLowerCase()),
      ),
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => {
        const compatibleAssets = getCompatibleAssets(template)
        const isCreating = creatingTasks.has(template.id)
        const selectedAsset = selectedAssets[template.id]

        return (
          <Card key={template.id} className="border-indigo/10">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg text-indigo line-clamp-2">{template.title}</CardTitle>
                {getPriorityIcon(template.priority)}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getPriorityColor(template.priority)}>{template.priority} priority</Badge>
                <Badge variant="outline" className="border-indigo/20 text-indigo">
                  {template.frequency}
                </Badge>
                <Badge variant="outline" className="border-indigo/20 text-indigo">
                  <Wrench className="w-3 h-3 mr-1" />
                  {template.category}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-indigo/70 line-clamp-3">{template.description}</p>

              <div className="flex items-center gap-2 text-sm text-indigo/60">
                <Clock className="w-4 h-4" />
                <span>~{template.estimatedTimeMin} minutes</span>
              </div>

              {compatibleAssets.length > 0 ? (
                <div className="space-y-3">
                  <Select
                    value={selectedAsset || ""}
                    onValueChange={(value) => setSelectedAssets((prev) => ({ ...prev, [template.id]: value }))}
                  >
                    <SelectTrigger className="border-indigo/20">
                      <SelectValue placeholder="Select an asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {compatibleAssets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name} {asset.brand && `(${asset.brand})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={() => handleCreateTask(template.id)}
                    disabled={!selectedAsset || isCreating}
                    className="w-full bg-indigo hover:bg-indigo/90 text-white"
                  >
                    {isCreating ? "Creating..." : "Add Task"}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-indigo/60 mb-2">No compatible assets found</p>
                  <p className="text-xs text-indigo/40">Compatible with: {template.assetTypes.join(", ")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
