"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { updateHousehold, inviteHouseholdMember, removeHouseholdMember } from "@/lib/actions/household"
import { toast } from "sonner"
import { Home, Users, Plus, Trash2, Mail } from "lucide-react"

interface HouseholdSettingsProps {
  household: any
}

export function HouseholdSettings({ household }: HouseholdSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [householdData, setHouseholdData] = useState({
    name: household?.name || "",
    home_type: household?.home_type || "",
    zip: household?.zip || "",
  })

  // Mock household members data - in real app, this would come from props
  const [members] = useState([
    { id: "1", email: "john@example.com", role: "admin", first_name: "John", last_name: "Doe" },
    { id: "2", email: "jane@example.com", role: "member", first_name: "Jane", last_name: "Smith" },
  ])

  const handleUpdateHousehold = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateHousehold(householdData)
      if (result.success) {
        toast.success("Household updated successfully")
      } else {
        toast.error(result.error || "Failed to update household")
      }
    } catch (error) {
      toast.error("An error occurred while updating household")
    } finally {
      setLoading(false)
    }
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteLoading(true)

    try {
      const result = await inviteHouseholdMember(inviteEmail)
      if (result.success) {
        toast.success("Invitation sent successfully")
        setInviteEmail("")
      } else {
        toast.error(result.error || "Failed to send invitation")
      }
    } catch (error) {
      toast.error("An error occurred while sending invitation")
    } finally {
      setInviteLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      const result = await removeHouseholdMember(memberId)
      if (result.success) {
        toast.success("Member removed successfully")
      } else {
        toast.error(result.error || "Failed to remove member")
      }
    } catch (error) {
      toast.error("An error occurred while removing member")
    }
  }

  return (
    <div className="space-y-6">
      {/* Household Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Household Information
          </CardTitle>
          <CardDescription>Update your household details and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateHousehold} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="household-name">Household Name</Label>
              <Input
                id="household-name"
                value={householdData.name}
                onChange={(e) => setHouseholdData({ ...householdData, name: e.target.value })}
                placeholder="Enter household name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="home-type">Home Type</Label>
                <Select
                  value={householdData.home_type}
                  onValueChange={(value) => setHouseholdData({ ...householdData, home_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select home type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={householdData.zip}
                  onChange={(e) => setHouseholdData({ ...householdData, zip: e.target.value })}
                  placeholder="Enter ZIP code"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Member Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Household Members
          </CardTitle>
          <CardDescription>Manage who has access to your household</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Members */}
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
                      {member.first_name?.charAt(0)}
                      {member.last_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {member.first_name} {member.last_name}
                      </p>
                      <p className="text-sm text-muted">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.role === "admin" ? "default" : "secondary"}>{member.role}</Badge>
                    {member.role !== "admin" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Invite New Member */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full bg-transparent">
                  <Plus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Household Member</DialogTitle>
                  <DialogDescription>Send an invitation to someone to join your household</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleInviteMember} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="invite-email">Email Address</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <DialogTrigger asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogTrigger>
                    <Button type="submit" disabled={inviteLoading}>
                      <Mail className="w-4 h-4 mr-2" />
                      {inviteLoading ? "Sending..." : "Send Invitation"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
