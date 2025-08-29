"use client"

import { useState } from "react"
import { Plus, TrendingUp, Calendar, DollarSign, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { recordSavings, type SavingsRecord } from "@/lib/actions/price-alerts"

interface SavingsTrackerProps {
  initialRecords: SavingsRecord[]
}

export function SavingsTracker({ initialRecords }: SavingsTrackerProps) {
  const [records, setRecords] = useState(initialRecords)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const totalSavings = records.reduce((sum, record) => sum + record.savings_cents, 0) / 100
  const thisMonthSavings =
    records
      .filter((record) => {
        const recordDate = new Date(record.purchase_date)
        const now = new Date()
        return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear()
      })
      .reduce((sum, record) => sum + record.savings_cents, 0) / 100

  const handleRecordSavings = async (formData: FormData) => {
    try {
      await recordSavings(formData)
      setIsCreateDialogOpen(false)
      window.location.reload()
    } catch (error) {
      console.error("Failed to record savings:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Savings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Total Savings</span>
            </div>
            <div className="text-3xl font-bold text-accent">${totalSavings.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">{records.length} purchases tracked</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">This Month</span>
            </div>
            <div className="text-3xl font-bold text-primary">${thisMonthSavings.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">
              {records.filter((r) => new Date(r.purchase_date).getMonth() === new Date().getMonth()).length} purchases
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              <span className="text-sm font-medium">Avg. Savings</span>
            </div>
            <div className="text-3xl font-bold text-secondary">
              ${records.length > 0 ? (totalSavings / records.length).toFixed(2) : "0.00"}
            </div>
            <div className="text-sm text-muted-foreground">per purchase</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Savings Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Recent Savings</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Savings
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Your Savings</DialogTitle>
            </DialogHeader>
            <form action={handleRecordSavings} className="space-y-4">
              <div>
                <Label htmlFor="product_name">Product Name</Label>
                <Input id="product_name" name="product_name" placeholder="e.g., Dyson V15 Vacuum" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="original_price">Original Price ($)</Label>
                  <Input
                    id="original_price"
                    name="original_price"
                    type="number"
                    step="0.01"
                    placeholder="749.99"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="paid_price">Price Paid ($)</Label>
                  <Input id="paid_price" name="paid_price" type="number" step="0.01" placeholder="649.99" required />
                </div>
              </div>
              <div>
                <Label htmlFor="retailer">Retailer</Label>
                <Input id="retailer" name="retailer" placeholder="Amazon, Best Buy, etc." />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" placeholder="Appliances, Electronics, etc." />
              </div>
              <div>
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  name="purchase_date"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" name="notes" placeholder="Any additional details..." />
              </div>
              <Button type="submit" className="w-full">
                Record Savings
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Savings Records */}
      <div className="space-y-4">
        {records.map((record) => (
          <Card key={record.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <ShoppingBag className="h-5 w-5 text-accent" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium">{record.product_name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {record.retailer && <span>{record.retailer}</span>}
                      {record.category && <Badge variant="outline">{record.category}</Badge>}
                      <span>{new Date(record.purchase_date).toLocaleDateString()}</span>
                    </div>
                    {record.notes && <p className="text-sm text-muted-foreground">{record.notes}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-accent">${(record.savings_cents / 100).toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">
                    ${(record.paid_price_cents / 100).toFixed(2)} vs ${(record.original_price_cents / 100).toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {records.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No savings recorded yet</h3>
          <p className="text-muted-foreground mb-4">Start tracking your savings to see how much you save over time</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Record Your First Savings
          </Button>
        </div>
      )}
    </div>
  )
}
