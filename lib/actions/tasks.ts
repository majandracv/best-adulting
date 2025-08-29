"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getTemplateById, calculateNextDueDate } from "@/lib/task-templates"

export async function createTask(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const assetId = formData.get("asset_id") as string
  const householdId = formData.get("household_id") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const frequency = formData.get("frequency") as string
  const dueDate = formData.get("due_date") as string

  if (!householdId || !title) {
    throw new Error("Household ID and task title are required")
  }

  const taskData = {
    asset_id: assetId || null,
    household_id: householdId,
    title,
    description: description || null,
    frequency: frequency || null,
    due_date: dueDate || null,
    status: "pending",
  }

  const { data, error } = await supabase.from("tasks").insert(taskData).select().single()

  if (error) {
    throw new Error(`Failed to create task: ${error.message}`)
  }

  revalidatePath("/tasks")
  revalidatePath("/dashboard")
  return { success: true, data }
}

export async function createTaskFromTemplate(templateId: string, assetId: string, householdId: string) {
  const template = getTemplateById(templateId)
  if (!template) {
    throw new Error("Template not found")
  }

  const supabase = await createClient()
  const nextDue = calculateNextDueDate(template.frequency)

  const taskData = {
    asset_id: assetId,
    household_id: householdId,
    title: template.title,
    description: template.description,
    frequency: template.frequency,
    due_date: nextDue.toISOString().split("T")[0],
    status: "pending",
  }

  const { data, error } = await supabase.from("tasks").insert(taskData).select().single()

  if (error) {
    throw new Error(`Failed to create task from template: ${error.message}`)
  }

  revalidatePath("/tasks")
  revalidatePath("/dashboard")
  return { success: true, data }
}

export async function completeTask(taskId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  // Get task details
  const { data: task, error: taskError } = await supabase.from("tasks").select("*").eq("id", taskId).single()

  if (taskError || !task) {
    throw new Error("Task not found")
  }

  const timeSpent = formData.get("time_spent_min") as string
  const notes = formData.get("notes") as string
  const costAmount = formData.get("cost_amount") as string
  const costVendor = formData.get("cost_vendor") as string
  const costCategory = formData.get("cost_category") as string

  let costId = null
  if (costAmount && Number.parseFloat(costAmount) > 0) {
    const costData = {
      household_id: task.household_id,
      amount_cents: Math.round(Number.parseFloat(costAmount) * 100),
      currency: "USD",
      vendor: costVendor || null,
      category: costCategory || "maintenance",
      linked_task_id: taskId,
    }

    const { data: cost, error: costError } = await supabase.from("costs").insert(costData).select().single()

    if (costError) {
      console.error("Failed to create cost record:", costError)
    } else {
      costId = cost.id
    }
  }

  // Create task log
  const taskLogData = {
    task_id: taskId,
    household_id: task.household_id,
    user_id: user.id,
    time_spent_min: timeSpent ? Number.parseInt(timeSpent) : null,
    notes: notes || null,
    cost_id: costId,
    completed_at: new Date().toISOString(),
  }

  const { error: logError } = await supabase.from("task_logs").insert(taskLogData)

  if (logError) {
    throw new Error(`Failed to log task completion: ${logError.message}`)
  }

  // Update task status and calculate next due date if recurring
  const updateData: any = { status: "completed" }

  if (task.frequency) {
    const nextDue = calculateNextDueDate(task.frequency)
    updateData.due_date = nextDue.toISOString().split("T")[0]
    updateData.status = "pending" // Reset to pending for next occurrence
  }

  await supabase.from("tasks").update(updateData).eq("id", taskId)

  revalidatePath("/tasks")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function snoozeTask(taskId: string, days = 1) {
  const supabase = await createClient()

  const { data: task, error: taskError } = await supabase.from("tasks").select("*").eq("id", taskId).single()

  if (taskError || !task) {
    throw new Error("Task not found")
  }

  const currentDue = task.due_date ? new Date(task.due_date) : new Date()
  const newDue = new Date(currentDue.getTime() + days * 24 * 60 * 60 * 1000)

  const { error } = await supabase
    .from("tasks")
    .update({ due_date: newDue.toISOString().split("T")[0] })
    .eq("id", taskId)

  if (error) {
    throw new Error(`Failed to snooze task: ${error.message}`)
  }

  revalidatePath("/tasks")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteTask(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("tasks").delete().eq("id", id)

  if (error) {
    throw new Error(`Failed to delete task: ${error.message}`)
  }

  revalidatePath("/tasks")
  revalidatePath("/dashboard")
  return { success: true }
}
