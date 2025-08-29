import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import Camera from "@/components/icons/Camera" // Assuming Camera icon component exists

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

async function createAction(formData: FormData) {
  "use server"
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const name = (formData.get("name") || "").toString().trim()
  const roomName = (formData.get("room") || "").toString().trim() || null
  const brand = (formData.get("brand") || "").toString().trim() || null
  const model = (formData.get("model") || "").toString().trim() || null

  if (!name) {
    throw new Error("Name is required")
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
  }

  console.log("[v0] Inserting asset data:", insertData)

  const { error } = await supabase.from("assets").insert(insertData)

  if (error) {
    console.log("[v0] Insert error:", error)
    throw new Error(`Insert failed: ${error.message}`)
  }

  redirect("/assets")
}

export default async function NewAssetPage() {
  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">Add Asset</h1>

      <div className="mb-6 p-4 bg-card rounded-lg border border-border">
        <h3 className="font-medium text-card-foreground mb-2">Quick Add with Camera</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Take a photo of your appliance label to automatically extract details
        </p>
        <a
          href="/assets/new/camera"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Camera className="w-4 h-4" />
          Use Camera
        </a>
      </div>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-2 text-muted-foreground">or enter manually</span>
        </div>
      </div>

      <form action={createAction} className="space-y-3">
        <input name="name" placeholder="Name (e.g., Fridge)" className="border rounded px-3 py-2 w-full" required />
        <input name="room" placeholder="Room (e.g., Kitchen)" className="border rounded px-3 py-2 w-full" />
        <input name="brand" placeholder="Brand" className="border rounded px-3 py-2 w-full" />
        <input name="model" placeholder="Model" className="border rounded px-3 py-2 w-full" />
        <button type="submit" className="rounded-md bg-indigo-600 text-white px-4 py-2">
          Save
        </button>
      </form>
    </div>
  )
}
