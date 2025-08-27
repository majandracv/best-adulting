"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { CostInsert, CostUpdate } from "@/lib/supabase/types"

export async function createCost(formData: FormData) {
  const supabase = await createClient()

  const householdId = formData.get("household_id") as string
  const category = formData.get("category") as string
  const vendor = formData.get("vendor") as string
  const amount = formData.get("amount") as string
  const currency = formData.get("currency") as string
  const receiptUrl = formData.get("receipt_url") as string
  const linkedTaskId = formData.get("linked_task_id") as string

  if (!householdId || !amount) {
    throw new Error("Household ID and amount are required")
  }

  // Convert amount to cents
  const amountCents = Math.round(Number.parseFloat(amount) * 100)

  const costData: CostInsert = {
    household_id: householdId,
    category: category || null,
    vendor: vendor || null,
    amount_cents: amountCents,
    currency: currency || "USD",
    receipt_url: receiptUrl || null,
    linked_task_id: linkedTaskId || null,
  }

  const { data, error } = await supabase.from("costs").insert(costData).select().single()

  if (error) {
    throw new Error(`Failed to create cost: ${error.message}`)
  }

  revalidatePath(`/households/${householdId}`)
  revalidatePath("/costs")
  revalidatePath("/dashboard")
  return { success: true, data }
}

export async function updateCost(id: string, formData: FormData) {
  const supabase = await createClient()

  const category = formData.get("category") as string
  const vendor = formData.get("vendor") as string
  const amount = formData.get("amount") as string
  const currency = formData.get("currency") as string
  const receiptUrl = formData.get("receipt_url") as string
  const linkedTaskId = formData.get("linked_task_id") as string

  const updateData: CostUpdate = {
    category: category || null,
    vendor: vendor || null,
    amount_cents: amount ? Math.round(Number.parseFloat(amount) * 100) : undefined,
    currency: currency || undefined,
    receipt_url: receiptUrl || null,
    linked_task_id: linkedTaskId || null,
  }

  const { data, error } = await supabase.from("costs").update(updateData).eq("id", id).select().single()

  if (error) {
    throw new Error(`Failed to update cost: ${error.message}`)
  }

  revalidatePath(`/households/${data.household_id}`)
  revalidatePath("/costs")
  revalidatePath(`/costs/${id}`)
  return { success: true, data }
}

export async function deleteCost(id: string) {
  const supabase = await createClient()

  // Get household_id before deletion for revalidation
  const { data: cost } = await supabase.from("costs").select("household_id").eq("id", id).single()

  const { error } = await supabase.from("costs").delete().eq("id", id)

  if (error) {
    throw new Error(`Failed to delete cost: ${error.message}`)
  }

  if (cost) {
    revalidatePath(`/households/${cost.household_id}`)
  }
  revalidatePath("/costs")
  revalidatePath("/dashboard")
  return { success: true }
}
