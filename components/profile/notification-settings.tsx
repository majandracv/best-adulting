"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  updateNotificationSettings,
  updatePrivacySettings,
  exportUserData,
  deleteUserAccount,
} from "@/lib/actions/privacy"
import { toast } from "sonner"
import { Bell, Shield, Download, Trash2, Mail, Smartphone, Globe, Eye, Lock, AlertTriangle } from "lucide-react"

interface NotificationSettingsProps {
  profile: any
}

export function NotificationSettings({ profile }: NotificationSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Mock notification settings - in real app, this would come from profile
  const [notifications, setNotifications] = useState({
    email_tasks: true,
    email_bookings: true,
    email_price_alerts: false,
    email_marketing: false,
    push_tasks: true,
    push_bookings: true,
    push_price_alerts: true,
    push_marketing: false,
    frequency: "daily",
    quiet_hours_start: "22:00",
    quiet_hours_end: "08:00",
  })

  const [privacy, setPrivacy] = useState({
    profile_visibility: "household",
    data_sharing: false,
    analytics_tracking: true,
    marketing_emails: false,
    third_party_sharing: false,
  })

  const handleUpdateNotifications = async () => {
    setLoading(true)
    try {
      const result = await updateNotificationSettings(notifications)
      if (result.success) {
        toast.success("Notification settings updated successfully")
      } else {
        toast.error(result.error || "Failed to update notification settings")
      }
    } catch (error) {
      toast.error("An error occurred while updating settings")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePrivacy = async () => {
    setLoading(true)
    try {
      const result = await updatePrivacySettings(privacy)
      if (result.success) {
        toast.success("Privacy settings updated successfully")
      } else {
        toast.error(result.error || "Failed to update privacy settings")
      }
    } catch (error) {
      toast.error("An error occurred while updating settings")
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    setExportLoading(true)
    try {
      const result = await exportUserData()
      if (result.success) {
        toast.success("Data export initiated. You'll receive an email when ready.")
      } else {
        toast.error(result.error || "Failed to export data")
      }
    } catch (error) {
      toast.error("An error occurred while exporting data")
    } finally {
      setExportLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      const result = await deleteUserAccount()
      if (result.success) {
        toast.success("Account deletion initiated")
      } else {
        toast.error(result.error || "Failed to delete account")
      }
    } catch (error) {
      toast.error("An error occurred while deleting account")
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Control how and when you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Notifications
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-tasks">Task Reminders</Label>
                  <p className="text-sm text-muted">Get notified about upcoming and overdue tasks</p>
                </div>
                <Switch
                  id="email-tasks"
                  checked={notifications.email_tasks}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email_tasks: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-bookings">Booking Updates</Label>
                  <p className="text-sm text-muted">Service provider confirmations and updates</p>
                </div>
                <Switch
                  id="email-bookings"
                  checked={notifications.email_bookings}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email_bookings: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-price-alerts">Price Alerts</Label>
                  <p className="text-sm text-muted">When items reach your target price</p>
                </div>
                <Switch
                  id="email-price-alerts"
                  checked={notifications.email_price_alerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email_price_alerts: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-marketing">Marketing Updates</Label>
                  <p className="text-sm text-muted">Product updates and tips</p>
                </div>
                <Switch
                  id="email-marketing"
                  checked={notifications.email_marketing}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email_marketing: checked })}
                />
              </div>
            </div>
          </div>

          {/* Push Notifications */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Push Notifications
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-tasks">Task Reminders</Label>
                  <p className="text-sm text-muted">Instant notifications for urgent tasks</p>
                </div>
                <Switch
                  id="push-tasks"
                  checked={notifications.push_tasks}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, push_tasks: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-bookings">Booking Updates</Label>
                  <p className="text-sm text-muted">Real-time service provider updates</p>
                </div>
                <Switch
                  id="push-bookings"
                  checked={notifications.push_bookings}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, push_bookings: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-price-alerts">Price Alerts</Label>
                  <p className="text-sm text-muted">Instant price drop notifications</p>
                </div>
                <Switch
                  id="push-price-alerts"
                  checked={notifications.push_price_alerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, push_price_alerts: checked })}
                />
              </div>
            </div>
          </div>

          {/* Notification Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Summary Frequency</Label>
              <Select
                value={notifications.frequency}
                onValueChange={(value) => setNotifications({ ...notifications, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="daily">Daily Summary</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiet-hours">Quiet Hours</Label>
              <div className="flex gap-2">
                <Select
                  value={notifications.quiet_hours_start}
                  onValueChange={(value) => setNotifications({ ...notifications, quiet_hours_start: value })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={`${i.toString().padStart(2, "0")}:00`}>
                        {`${i.toString().padStart(2, "0")}:00`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="self-center">to</span>
                <Select
                  value={notifications.quiet_hours_end}
                  onValueChange={(value) => setNotifications({ ...notifications, quiet_hours_end: value })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={`${i.toString().padStart(2, "0")}:00`}>
                        {`${i.toString().padStart(2, "0")}:00`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleUpdateNotifications} disabled={loading}>
              {loading ? "Saving..." : "Save Notification Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Security
          </CardTitle>
          <CardDescription>Control your data privacy and account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="profile-visibility" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Profile Visibility
                </Label>
                <p className="text-sm text-muted">Who can see your profile information</p>
              </div>
              <Select
                value={privacy.profile_visibility}
                onValueChange={(value) => setPrivacy({ ...privacy, profile_visibility: value })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="household">Household Only</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="data-sharing" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Data Sharing
                </Label>
                <p className="text-sm text-muted">Share anonymized data to improve the service</p>
              </div>
              <Switch
                id="data-sharing"
                checked={privacy.data_sharing}
                onCheckedChange={(checked) => setPrivacy({ ...privacy, data_sharing: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analytics-tracking" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Analytics Tracking
                </Label>
                <p className="text-sm text-muted">Help us improve by tracking app usage</p>
              </div>
              <Switch
                id="analytics-tracking"
                checked={privacy.analytics_tracking}
                onCheckedChange={(checked) => setPrivacy({ ...privacy, analytics_tracking: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="third-party-sharing">Third-party Sharing</Label>
                <p className="text-sm text-muted">Allow sharing data with trusted partners</p>
              </div>
              <Switch
                id="third-party-sharing"
                checked={privacy.third_party_sharing}
                onCheckedChange={(checked) => setPrivacy({ ...privacy, third_party_sharing: checked })}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleUpdatePrivacy} disabled={loading}>
              {loading ? "Saving..." : "Save Privacy Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Data Management
          </CardTitle>
          <CardDescription>Export or delete your account data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Export Your Data</h4>
              <p className="text-sm text-muted">Download a copy of all your data</p>
            </div>
            <Button variant="outline" onClick={handleExportData} disabled={exportLoading}>
              <Download className="w-4 h-4 mr-2" />
              {exportLoading ? "Exporting..." : "Export Data"}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
            <div>
              <h4 className="font-medium text-destructive">Delete Account</h4>
              <p className="text-sm text-muted">Permanently delete your account and all data</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Delete Account
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove all your data
                    from our servers.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                  <DialogTrigger asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogTrigger>
                  <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleteLoading}>
                    {deleteLoading ? "Deleting..." : "Delete Account"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
