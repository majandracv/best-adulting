"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PersonalInfoForm } from "./personal-info-form"
import { HouseholdSettings } from "./household-settings"
import { PlanUpgrade } from "./plan-upgrade"
import { NotificationSettings } from "./notification-settings"
import { UserIcon, Home, CreditCard, Bell } from "lucide-react"

interface ProfileTabsProps {
  user: User
  profile: any
  household: any
}

export function ProfileTabs({ user, profile, household }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("personal")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-8">
        <TabsTrigger value="personal" className="flex items-center gap-2">
          <UserIcon className="w-4 h-4" />
          Personal Info
        </TabsTrigger>
        <TabsTrigger value="household" className="flex items-center gap-2">
          <Home className="w-4 h-4" />
          Household
        </TabsTrigger>
        <TabsTrigger value="billing" className="flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Plan & Billing
        </TabsTrigger>
        <TabsTrigger value="notifications" className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Notifications
        </TabsTrigger>
      </TabsList>

      <TabsContent value="personal">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details and account preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <PersonalInfoForm user={user} profile={profile} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="household">
        <Card>
          <CardHeader>
            <CardTitle>Household Settings</CardTitle>
            <CardDescription>Manage your household information and member access</CardDescription>
          </CardHeader>
          <CardContent>
            <HouseholdSettings household={household} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="billing">
        <Card>
          <CardHeader>
            <CardTitle>Plan & Billing</CardTitle>
            <CardDescription>Manage your subscription and billing information</CardDescription>
          </CardHeader>
          <CardContent>
            <PlanUpgrade profile={profile} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Control how and when you receive notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationSettings profile={profile} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
