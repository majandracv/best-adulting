"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { TaskInsert, TaskUpdate, TaskLogInsert } from "@/lib/supabase/types"

export async function snoozeTask(taskId: string, days = 1) {
  const supabase = await createClient()

  const { data: task, error: taskError } = await supabase.from("tasks").select("*").eq("id", taskId).single()

  if (taskError || !task) {
    throw new Error("Task not found")
  }

  const currentDue = task.next_due ? new Date(task.next_due) : new Date()
  const newDue = new Date(currentDue.getTime() + days * 24 * 60 * 60 * 1000)

  const { error } = await supabase
    .from("tasks")
    .update({ next_due: newDue.toISOString().split("T")[0] })
    .eq("id", taskId)

  if (error) {
    throw new Error(`Failed to snooze task: ${error.message}`)
  }

  revalidatePath(`/households/${task.household_id}`)
  revalidatePath("/tasks")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function createTask(formData: FormData) {
  const supabase = await createClient()

  const assetId = formData.get("asset_id") as string
  const householdId = formData.get("household_id") as string
  const title = formData.get("title") as string
  const instructions = formData.get("instructions") as string
  const frequencyType = formData.get("frequency_type") as string
  const frequencyValue = formData.get("frequency_value") as string
  const nextDue = formData.get("next_due") as string
  const assignedTo = formData.get("assigned_to") as string

  if (!householdId || !title) {
    throw new Error("Household ID and task title are required")
  }

  const taskData: TaskInsert = {
    asset_id: assetId || null,
    household_id: householdId,
    title,
    instructions: instructions || null,
    frequency_type: frequencyType || null,
    frequency_value: frequencyValue ? Number.parseInt(frequencyValue) : null,
    next_due: nextDue || null,
    assigned_to: assignedTo || null,
  }

  const { data, error } = await supabase.from("tasks").insert(taskData).select().single()

  if (error) {
    throw new Error(`Failed to create task: ${error.message}`)
  }

  revalidatePath(`/households/${householdId}`)
  revalidatePath("/tasks")
  revalidatePath("/dashboard")
  return { success: true, data }
}

export async function updateTask(id: string, formData: FormData) {
  const supabase = await createClient()

  const title = formData.get("title") as string
  const instructions = formData.get("instructions") as string
  const frequencyType = formData.get("frequency_type") as string
  const frequencyValue = formData.get("frequency_value") as string
  const nextDue = formData.get("next_due") as string
  const assignedTo = formData.get("assigned_to") as string
  const isArchived = formData.get("is_archived") as string

  const updateData: TaskUpdate = {
    title: title || undefined,
    instructions: instructions || null,
    frequency_type: frequencyType || null,
    frequency_value: frequencyValue ? Number.parseInt(frequencyValue) : null,
    next_due: nextDue || null,
    assigned_to: assignedTo || null,
    is_archived: isArchived === "true",
  }

  const { data, error } = await supabase.from("tasks").update(updateData).eq("id", id).select().single()

  if (error) {
    throw new Error(`Failed to update task: ${error.message}`)
  }

  revalidatePath(`/households/${data.household_id}`)
  revalidatePath("/tasks")
  revalidatePath(`/tasks/${id}`)
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
  const costId = formData.get("cost_id") as string

  // Create task log
  const taskLogData: TaskLogInsert = {
    task_id: taskId,
    household_id: task.household_id,
    user_id: user.id,
    time_spent_min: timeSpent ? Number.parseInt(timeSpent) : null,
    notes: notes || null,
    cost_id: costId || null,
  }

  const { error: logError } = await supabase.from("task_logs").insert(taskLogData)

  if (logError) {
    throw new Error(`Failed to log task completion: ${logError.message}`)
  }

  // Update next due date based on frequency
  if (task.frequency_type && task.frequency_value) {
    const nextDue = calculateNextDueDate(task.frequency_type, task.frequency_value)

    await supabase.from("tasks").update({ next_due: nextDue }).eq("id", taskId)
  }

  revalidatePath(`/households/${task.household_id}`)
  revalidatePath("/tasks")
  revalidatePath(`/tasks/${taskId}`)
  return { success: true }
}

export async function deleteTask(id: string) {
  const supabase = await createClient()

  // Get household_id before deletion for revalidation
  const { data: task } = await supabase.from("tasks").select("household_id").eq("id", id).single()

  const { error } = await supabase.from("tasks").delete().eq("id", id)

  if (error) {
    throw new Error(`Failed to delete task: ${error.message}`)
  }

  if (task) {
    revalidatePath(`/households/${task.household_id}`)
  }
  revalidatePath("/tasks")
  revalidatePath("/dashboard")
  return { success: true }
}

// Helper function to calculate next due date
function calculateNextDueDate(frequencyType: string, frequencyValue: number): string {
  const now = new Date()

  switch (frequencyType) {
    case "daily":
      now.setDate(now.getDate() + frequencyValue)
      break
    case "weekly":
      now.setDate(now.getDate() + frequencyValue * 7)
      break
    case "monthly":
      now.setMonth(now.getMonth() + frequencyValue)
      break
    case "quarterly":
      now.setMonth(now.getMonth() + frequencyValue * 3)
      break
    case "yearly":
      now.setFullYear(now.getFullYear() + frequencyValue)
      break
    default:
      return now.toISOString().split("T")[0]
  }

  return now.toISOString().split("T")[0]
}
