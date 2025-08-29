"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { upgradePlan, updateBillingInfo } from "@/lib/actions/billing"
import { toast } from "sonner"
import { Check, CreditCard, Star, Zap, Crown, Calendar, Receipt } from "lucide-react"

interface PlanUpgradeProps {
  profile: any
}

export function PlanUpgrade({ profile }: PlanUpgradeProps) {
  const [loading, setLoading] = useState(false)
  const [billingLoading, setBillingLoading] = useState(false)
  const [billingData, setBillingData] = useState({
    card_number: "",
    expiry_month: "",
    expiry_year: "",
    cvv: "",
    billing_name: "",
    billing_address: "",
    billing_city: "",
    billing_state: "",
    billing_zip: "",
  })

  // Mock current plan data - in real app, this would come from profile
  const currentPlan = profile?.plan_tier || "free"
  const assetsUsed = 3 // Mock data
  const assetsLimit = currentPlan === "free" ? 5 : currentPlan === "pro" ? 50 : 999

  const plans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      period: "forever",
      description: "Perfect for getting started",
      icon: Star,
      features: ["Up to 5 assets", "Basic task management", "Price comparison", "Community support"],
      limits: {
        assets: 5,
        tasks: 25,
        bookings: 2,
      },
    },
    {
      id: "pro",
      name: "Pro",
      price: 9.99,
      period: "month",
      description: "For serious household managers",
      icon: Zap,
      popular: true,
      features: [
        "Up to 50 assets",
        "Advanced task templates",
        "Priority booking",
        "OCR asset capture",
        "Email support",
        "Maintenance reminders",
      ],
      limits: {
        assets: 50,
        tasks: 200,
        bookings: 20,
      },
    },
    {
      id: "premium",
      name: "Premium",
      price: 19.99,
      period: "month",
      description: "For property managers and large households",
      icon: Crown,
      features: [
        "Unlimited assets",
        "Multi-household management",
        "Custom task templates",
        "Priority support",
        "Advanced analytics",
        "API access",
        "White-label options",
      ],
      limits: {
        assets: 999,
        tasks: 999,
        bookings: 999,
      },
    },
  ]

  const handleUpgrade = async (planId: string) => {
    setLoading(true)
    try {
      const result = await upgradePlan(planId)
      if (result.success) {
        toast.success("Plan upgraded successfully!")
      } else {
        toast.error(result.error || "Failed to upgrade plan")
      }
    } catch (error) {
      toast.error("An error occurred while upgrading")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateBilling = async (e: React.FormEvent) => {
    e.preventDefault()
    setBillingLoading(true)
    try {
      const result = await updateBillingInfo(billingData)
      if (result.success) {
        toast.success("Billing information updated successfully")
      } else {
        toast.error(result.error || "Failed to update billing information")
      }
    } catch (error) {
      toast.error("An error occurred while updating billing")
    } finally {
      setBillingLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Current Plan
          </CardTitle>
          <CardDescription>Your current subscription and usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold capitalize">{currentPlan} Plan</h3>
                <p className="text-muted">
                  {currentPlan === "free" ? "Free forever" : `$${plans.find((p) => p.id === currentPlan)?.price}/month`}
                </p>
              </div>
              <Badge variant={currentPlan === "free" ? "secondary" : "default"} className="capitalize">
                {currentPlan}
              </Badge>
            </div>

            {/* Usage Stats */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Assets Used</span>
                  <span>
                    {assetsUsed} / {assetsLimit === 999 ? "∞" : assetsLimit}
                  </span>
                </div>
                <Progress value={(assetsUsed / assetsLimit) * 100} className="h-2" />
              </div>
            </div>

            {currentPlan === "free" && assetsUsed >= 4 && (
              <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                <p className="text-sm text-accent-foreground">
                  You're almost at your asset limit. Upgrade to Pro for up to 50 assets!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const Icon = plan.icon
          const isCurrent = plan.id === currentPlan
          const isUpgrade = plans.findIndex((p) => p.id === currentPlan) < plans.findIndex((p) => p.id === plan.id)

          return (
            <Card key={plan.id} className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>{plan.name}</CardTitle>
                <div className="text-2xl font-bold">
                  ${plan.price}
                  {plan.price > 0 && <span className="text-sm font-normal text-muted">/{plan.period}</span>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={isCurrent ? "secondary" : isUpgrade ? "default" : "outline"}
                  disabled={isCurrent || loading}
                  onClick={() => !isCurrent && handleUpgrade(plan.id)}
                >
                  {isCurrent ? "Current Plan" : isUpgrade ? "Upgrade" : "Downgrade"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Billing Information */}
      {currentPlan !== "free" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Billing Information
            </CardTitle>
            <CardDescription>Manage your payment method and billing details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current Payment Method */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted">Expires 12/25</p>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Update Billing Information</DialogTitle>
                        <DialogDescription>Update your payment method and billing address</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleUpdateBilling} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="card-number">Card Number</Label>
                          <Input
                            id="card-number"
                            placeholder="1234 5678 9012 3456"
                            value={billingData.card_number}
                            onChange={(e) => setBillingData({ ...billingData, card_number: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-2">
                            <Label htmlFor="expiry-month">Month</Label>
                            <Select
                              value={billingData.expiry_month}
                              onValueChange={(value) => setBillingData({ ...billingData, expiry_month: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="MM" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => (
                                  <SelectItem key={i + 1} value={String(i + 1).padStart(2, "0")}>
                                    {String(i + 1).padStart(2, "0")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="expiry-year">Year</Label>
                            <Select
                              value={billingData.expiry_year}
                              onValueChange={(value) => setBillingData({ ...billingData, expiry_year: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="YY" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => (
                                  <SelectItem key={i} value={String(new Date().getFullYear() + i).slice(-2)}>
                                    {String(new Date().getFullYear() + i).slice(-2)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              value={billingData.cvv}
                              onChange={(e) => setBillingData({ ...billingData, cvv: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billing-name">Name on Card</Label>
                          <Input
                            id="billing-name"
                            placeholder="John Doe"
                            value={billingData.billing_name}
                            onChange={(e) => setBillingData({ ...billingData, billing_name: e.target.value })}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <DialogTrigger asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogTrigger>
                          <Button type="submit" disabled={billingLoading}>
                            {billingLoading ? "Updating..." : "Update"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Billing History */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Recent Invoices
                </h4>
                <div className="space-y-2">
                  {[
                    { date: "Dec 1, 2024", amount: "$9.99", status: "Paid" },
                    { date: "Nov 1, 2024", amount: "$9.99", status: "Paid" },
                    { date: "Oct 1, 2024", amount: "$9.99", status: "Paid" },
                  ].map((invoice, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{invoice.date}</p>
                        <p className="text-sm text-muted">Pro Plan</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{invoice.amount}</p>
                        <Badge variant="secondary" className="text-xs">
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
