import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const householdId = searchParams.get("household_id")
    const includeArchived = searchParams.get("include_archived") === "true"

    if (!householdId) {
      return NextResponse.json({ error: "Household ID is required" }, { status: 400 })
    }

    let query = supabase
      .from("tasks")
      .select(`
        *,
        assets(name, type),
        users_profile!tasks_assigned_to_fkey(full_name)
      `)
      .eq("household_id", householdId)
      .order("next_due", { ascending: true, nullsFirst: false })

    if (!includeArchived) {
      query = query.eq("is_archived", false)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { asset_id, household_id, title, instructions, frequency_type, frequency_value, next_due, assigned_to } = body

    if (!household_id || !title) {
      return NextResponse.json({ error: "Household ID and title are required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        asset_id: asset_id || null,
        household_id,
        title,
        instructions: instructions || null,
        frequency_type: frequency_type || null,
        frequency_value: frequency_value || null,
        next_due: next_due || null,
        assigned_to: assigned_to || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
