import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// Helper: get or create a default household
async function ensureHouseholdForUser(supabase: any, userId: string) {
  const { data: existing } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .limit(1)
    .single()

  if (existing?.household_id) return existing.household_id

  const { data: hh, error: hhErr } = await supabase
    .from("households")
    .insert({ name: "My Household" })
    .select("id")
    .single()
  if (hhErr) throw new Error(hhErr.message)

  const { error: memErr } = await supabase
    .from("household_members")
    .insert({ household_id: hh.id, user_id: userId, role: "owner" })
  if (memErr) throw new Error(memErr.message)

  return hh.id
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const name = (formData.get("name") || "").toString().trim()
    const roomName = (formData.get("room") || "").toString().trim() || null
    const brand = (formData.get("brand") || "").toString().trim() || null
    const model = (formData.get("model") || "").toString().trim() || null
    const serialNumber = (formData.get("serialNumber") || "").toString().trim() || null
    const category = (formData.get("category") || "").toString().trim() || null

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const householdId = await ensureHouseholdForUser(supabase, user.id)

    let roomId = null
    if (roomName) {
      // First try to find existing room
      const { data: existingRoom } = await supabase
        .from("rooms")
        .select("id")
        .eq("household_id", householdId)
        .eq("name", roomName)
        .single()

      if (existingRoom) {
        roomId = existingRoom.id
      } else {
        // Create new room if it doesn't exist
        const { data: newRoom, error: roomError } = await supabase
          .from("rooms")
          .insert({ household_id: householdId, name: roomName })
          .select("id")
          .single()

        if (roomError) {
          throw new Error(`Room creation failed: ${roomError.message}`)
        }
        roomId = newRoom.id
      }
    }

    const insertData = {
      household_id: householdId,
      name,
      room_id: roomId,
      brand,
      model,
      serial_number: serialNumber,
      category,
    }

    console.log("[v0] Inserting asset data:", insertData)

    const { data: asset, error } = await supabase.from("assets").insert(insertData).select("id").single()

    if (error) {
      console.log("[v0] Insert error:", error)
      throw new Error(`Insert failed: ${error.message}`)
    }

    return NextResponse.json({
      success: true,
      assetId: asset.id,
      message: "Asset created successfully",
    })
  } catch (error) {
    console.error("Asset creation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create asset" },
      { status: 500 },
    )
  }
}
