"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export interface PriceAlert {
  id: string
  user_id: string
  household_id: string
  product_name: string
  target_price_cents: number
  current_price_cents?: number
  retailer?: string
  product_url?: string
  is_active: boolean
  alert_frequency: "immediate" | "daily" | "weekly"
  last_checked_at: string
  created_at: string
  updated_at: string
}

export interface SavingsRecord {
  id: string
  user_id: string
  household_id: string
  product_name: string
  original_price_cents: number
  paid_price_cents: number
  savings_cents: number
  retailer?: string
  purchase_date: string
  category?: string
  notes?: string
  created_at: string
}

export async function createPriceAlert(formData: FormData) {
  const supabase = createServerClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Get user's household
  const { data: household } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single()

  if (!household) {
    throw new Error("User must belong to a household")
  }

  const productName = formData.get("product_name") as string
  const targetPrice = Number.parseFloat(formData.get("target_price") as string)
  const retailer = formData.get("retailer") as string
  const productUrl = formData.get("product_url") as string
  const alertFrequency = formData.get("alert_frequency") as "immediate" | "daily" | "weekly"

  const { error } = await supabase.from("price_alerts").insert({
    user_id: user.id,
    household_id: household.household_id,
    product_name: productName,
    target_price_cents: Math.round(targetPrice * 100),
    retailer: retailer || null,
    product_url: productUrl || null,
    alert_frequency: alertFrequency || "daily",
  })

  if (error) {
    throw new Error(`Failed to create price alert: ${error.message}`)
  }

  revalidatePath("/price-compare/alerts")
  return { success: true }
}

export async function updatePriceAlert(alertId: string, formData: FormData) {
  const supabase = createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  const targetPrice = Number.parseFloat(formData.get("target_price") as string)
  const isActive = formData.get("is_active") === "true"
  const alertFrequency = formData.get("alert_frequency") as "immediate" | "daily" | "weekly"

  const { error } = await supabase
    .from("price_alerts")
    .update({
      target_price_cents: Math.round(targetPrice * 100),
      is_active: isActive,
      alert_frequency: alertFrequency,
      updated_at: new Date().toISOString(),
    })
    .eq("id", alertId)
    .eq("user_id", user.id)

  if (error) {
    throw new Error(`Failed to update price alert: ${error.message}`)
  }

  revalidatePath("/price-compare/alerts")
  return { success: true }
}

export async function deletePriceAlert(alertId: string) {
  const supabase = createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  const { error } = await supabase.from("price_alerts").delete().eq("id", alertId).eq("user_id", user.id)

  if (error) {
    throw new Error(`Failed to delete price alert: ${error.message}`)
  }

  revalidatePath("/price-compare/alerts")
  return { success: true }
}

export async function recordSavings(formData: FormData) {
  const supabase = createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Get user's household
  const { data: household } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .single()

  if (!household) {
    throw new Error("User must belong to a household")
  }

  const productName = formData.get("product_name") as string
  const originalPrice = Number.parseFloat(formData.get("original_price") as string)
  const paidPrice = Number.parseFloat(formData.get("paid_price") as string)
  const retailer = formData.get("retailer") as string
  const category = formData.get("category") as string
  const notes = formData.get("notes") as string
  const purchaseDate = formData.get("purchase_date") as string

  const { error } = await supabase.from("savings_records").insert({
    user_id: user.id,
    household_id: household.household_id,
    product_name: productName,
    original_price_cents: Math.round(originalPrice * 100),
    paid_price_cents: Math.round(paidPrice * 100),
    retailer: retailer || null,
    category: category || null,
    notes: notes || null,
    purchase_date: purchaseDate || new Date().toISOString().split("T")[0],
  })

  if (error) {
    throw new Error(`Failed to record savings: ${error.message}`)
  }

  revalidatePath("/price-compare/savings")
  return { success: true }
}

export async function getPriceAlerts(): Promise<PriceAlert[]> {
  const supabase = createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return []
  }

  const { data, error } = await supabase
    .from("price_alerts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching price alerts:", error)
    return []
  }

  return data || []
}

export async function getSavingsRecords(): Promise<SavingsRecord[]> {
  const supabase = createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return []
  }

  const { data, error } = await supabase
    .from("savings_records")
    .select("*")
    .eq("user_id", user.id)
    .order("purchase_date", { ascending: false })

  if (error) {
    console.error("Error fetching savings records:", error)
    return []
  }

  return data || []
}
