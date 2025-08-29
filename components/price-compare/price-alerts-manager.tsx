"use client"

import { useState } from "react"
import { Plus, Bell, BellOff, Edit, Trash2, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createPriceAlert, updatePriceAlert, deletePriceAlert, type PriceAlert } from "@/lib/actions/price-alerts"

interface PriceAlertsManagerProps {
  initialAlerts: PriceAlert[]
}

export function PriceAlertsManager({ initialAlerts }: PriceAlertsManagerProps) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingAlert, setEditingAlert] = useState<PriceAlert | null>(null)

  const handleCreateAlert = async (formData: FormData) => {
    try {
      await createPriceAlert(formData)
      setIsCreateDialogOpen(false)
      // Refresh alerts - in a real app, you'd refetch from server
      window.location.reload()
    } catch (error) {
      console.error("Failed to create alert:", error)
    }
  }

  const handleUpdateAlert = async (alertId: string, formData: FormData) => {
    try {
      await updatePriceAlert(alertId, formData)
      setEditingAlert(null)
      window.location.reload()
    } catch (error) {
      console.error("Failed to update alert:", error)
    }
  }

  const handleDeleteAlert = async (alertId: string) => {
    try {
      await deletePriceAlert(alertId)
      setAlerts(alerts.filter((alert) => alert.id !== alertId))
    } catch (error) {
      console.error("Failed to delete alert:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Alert Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">{alerts.filter((a) => a.is_active).length} active alerts</div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Price Alert</DialogTitle>
            </DialogHeader>
            <form action={handleCreateAlert} className="space-y-4">
              <div>
                <Label htmlFor="product_name">Product Name</Label>
                <Input id="product_name" name="product_name" placeholder="e.g., Dyson V15 Vacuum" required />
              </div>
              <div>
                <Label htmlFor="target_price">Target Price ($)</Label>
                <Input id="target_price" name="target_price" type="number" step="0.01" placeholder="599.99" required />
              </div>
              <div>
                <Label htmlFor="retailer">Retailer (Optional)</Label>
                <Input id="retailer" name="retailer" placeholder="Amazon, Best Buy, etc." />
              </div>
              <div>
                <Label htmlFor="product_url">Product URL (Optional)</Label>
                <Input id="product_url" name="product_url" type="url" placeholder="https://..." />
              </div>
              <div>
                <Label htmlFor="alert_frequency">Alert Frequency</Label>
                <Select name="alert_frequency" defaultValue="daily">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Create Alert
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className={`${!alert.is_active ? "opacity-60" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {alert.is_active ? (
                    <Bell className="h-4 w-4 text-accent" />
                  ) : (
                    <BellOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Badge variant={alert.is_active ? "default" : "secondary"}>
                    {alert.is_active ? "Active" : "Paused"}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditingAlert(alert)} className="h-8 w-8 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-sm">{alert.product_name}</h3>
                  {alert.retailer && <p className="text-xs text-muted-foreground">{alert.retailer}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-accent" />
                  <span className="text-lg font-bold">${(alert.target_price_cents / 100).toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground">target</span>
                </div>
                {alert.current_price_cents && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Current: </span>
                    <span className="font-medium">${(alert.current_price_cents / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">Alerts: {alert.alert_frequency}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No price alerts yet</h3>
          <p className="text-muted-foreground mb-4">Create your first alert to get notified of great deals</p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Alert
          </Button>
        </div>
      )}

      {/* Edit Alert Dialog */}
      {editingAlert && (
        <Dialog open={!!editingAlert} onOpenChange={() => setEditingAlert(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Price Alert</DialogTitle>
            </DialogHeader>
            <form action={(formData) => handleUpdateAlert(editingAlert.id, formData)} className="space-y-4">
              <div>
                <Label htmlFor="edit_target_price">Target Price ($)</Label>
                <Input
                  id="edit_target_price"
                  name="target_price"
                  type="number"
                  step="0.01"
                  defaultValue={(editingAlert.target_price_cents / 100).toFixed(2)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_alert_frequency">Alert Frequency</Label>
                <Select name="alert_frequency" defaultValue={editingAlert.alert_frequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="edit_is_active" name="is_active" defaultChecked={editingAlert.is_active} />
                <Label htmlFor="edit_is_active">Active</Label>
              </div>
              <Button type="submit" className="w-full">
                Update Alert
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
