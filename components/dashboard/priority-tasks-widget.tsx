import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckSquare, Calendar, Package } from "lucide-react"
import Link from "next/link"

interface PriorityTasksWidgetProps {
  tasks: any[]
}

export function PriorityTasksWidget({ tasks }: PriorityTasksWidgetProps) {
  const priorityTasks = tasks
    .filter((task) => task.status === "pending")
    .sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    })
    .slice(0, 5)

  return (
    <Card className="border-indigo/10">
      <CardHeader>
        <CardTitle className="text-indigo flex items-center gap-2">
          <CheckSquare className="w-5 h-5" />
          Priority Tasks
        </CardTitle>
      </CardHeader>
      <CardContent>
        {priorityTasks.length > 0 ? (
          <div className="space-y-3">
            {priorityTasks.map((task) => {
              const isOverdue = task.due_date && new Date(task.due_date) < new Date()
              const isDueToday = task.due_date && new Date(task.due_date).toDateString() === new Date().toDateString()

              return (
                <div key={task.id} className="flex items-center justify-between gap-3 p-3 bg-indigo/5 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-indigo truncate">{task.title}</p>
                    <div className="flex items-center gap-2 text-sm text-indigo/60">
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {task.assets && (
                        <div className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          <span>{task.assets.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isOverdue && <Badge className="bg-red-100 text-red-700 border-red-200">Overdue</Badge>}
                    {isDueToday && !isOverdue && (
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200">Today</Badge>
                    )}
                    {task.frequency && (
                      <Badge variant="outline" className="border-indigo/20 text-indigo">
                        {task.frequency}
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
            <Link href="/tasks">
              <Button variant="outline" size="sm" className="w-full border-indigo/20 text-indigo bg-transparent">
                View All Tasks
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckSquare className="w-8 h-8 text-indigo/30 mx-auto mb-2" />
            <p className="text-indigo/60 text-sm">No pending tasks</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
