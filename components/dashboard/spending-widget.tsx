import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign } from "lucide-react"

interface SpendingWidgetProps {
  costs: any[]
}

export function SpendingWidget({ costs }: SpendingWidgetProps) {
  const totalSpending = costs.reduce((sum, cost) => sum + cost.amount_cents / 100, 0)

  const categorySpending = costs.reduce(
    (acc, cost) => {
      const category = cost.category || "other"
      acc[category] = (acc[category] || 0) + cost.amount_cents / 100
      return acc
    },
    {} as Record<string, number>,
  )

  const topCategories = Object.entries(categorySpending)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  const recentCosts = costs
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)

  return (
    <Card className="border-indigo/10">
      <CardHeader>
        <CardTitle className="text-indigo flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Monthly Spending
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo">${totalSpending.toFixed(0)}</p>
            <p className="text-sm text-indigo/60">This month</p>
          </div>

          {topCategories.length > 0 && (
            <div>
              <h4 className="font-medium text-indigo mb-2">Top Categories</h4>
              <div className="space-y-2">
                {topCategories.map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-indigo/70 capitalize">{category}</span>
                    <Badge variant="outline" className="border-indigo/20 text-indigo">
                      ${amount.toFixed(0)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recentCosts.length > 0 && (
            <div>
              <h4 className="font-medium text-indigo mb-2">Recent Expenses</h4>
              <div className="space-y-2">
                {recentCosts.map((cost) => (
                  <div key={cost.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-indigo/70">{cost.vendor || "Unknown vendor"}</p>
                      <p className="text-xs text-indigo/50">{new Date(cost.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="font-medium text-indigo">${(cost.amount_cents / 100).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {costs.length === 0 && (
            <div className="text-center py-6">
              <DollarSign className="w-8 h-8 text-indigo/30 mx-auto mb-2" />
              <p className="text-indigo/60 text-sm">No expenses recorded</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
