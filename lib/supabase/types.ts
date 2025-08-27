// Additional type utilities for Best Adulting
import type { Database } from "@/lib/database.types"

// Extract table types for easier use
export type Tables = Database["public"]["Tables"]
export type Views = Database["public"]["Views"]
export type Functions = Database["public"]["Functions"]

// Row types
export type UserProfile = Tables["users_profile"]["Row"]
export type Household = Tables["households"]["Row"]
export type HouseholdMember = Tables["household_members"]["Row"]
export type Room = Tables["rooms"]["Row"]
export type Asset = Tables["assets"]["Row"]
export type Task = Tables["tasks"]["Row"]
export type TaskLog = Tables["task_logs"]["Row"]
export type Cost = Tables["costs"]["Row"]
export type Provider = Tables["providers"]["Row"]
export type Booking = Tables["bookings"]["Row"]
export type Product = Tables["products"]["Row"]
export type ProductOffer = Tables["product_offers"]["Row"]

// Insert types
export type UserProfileInsert = Tables["users_profile"]["Insert"]
export type HouseholdInsert = Tables["households"]["Insert"]
export type HouseholdMemberInsert = Tables["household_members"]["Insert"]
export type RoomInsert = Tables["rooms"]["Insert"]
export type AssetInsert = Tables["assets"]["Insert"]
export type TaskInsert = Tables["tasks"]["Insert"]
export type TaskLogInsert = Tables["task_logs"]["Insert"]
export type CostInsert = Tables["costs"]["Insert"]
export type ProviderInsert = Tables["providers"]["Insert"]
export type BookingInsert = Tables["bookings"]["Insert"]
export type ProductInsert = Tables["products"]["Insert"]
export type ProductOfferInsert = Tables["product_offers"]["Insert"]

// Update types
export type UserProfileUpdate = Tables["users_profile"]["Update"]
export type HouseholdUpdate = Tables["households"]["Update"]
export type HouseholdMemberUpdate = Tables["household_members"]["Update"]
export type RoomUpdate = Tables["rooms"]["Update"]
export type AssetUpdate = Tables["assets"]["Update"]
export type TaskUpdate = Tables["tasks"]["Update"]
export type TaskLogUpdate = Tables["task_logs"]["Update"]
export type CostUpdate = Tables["costs"]["Update"]
export type ProviderUpdate = Tables["providers"]["Update"]
export type BookingUpdate = Tables["bookings"]["Update"]
export type ProductUpdate = Tables["products"]["Update"]
export type ProductOfferUpdate = Tables["product_offers"]["Update"]

// View types
export type UserHousehold = Views["user_households"]["Row"]

// Enum types
export type UserTier = "free" | "pro" | "family"
export type HouseholdRole = "owner" | "admin" | "member"
export type HomeType = "apartment" | "house" | "condo" | "townhouse" | "other"
export type FrequencyType = "once" | "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
export type BookingStatus = "requested" | "confirmed" | "in_progress" | "completed" | "cancelled"

// Extended types with relationships
export type AssetWithRoom = Asset & {
  rooms: Pick<Room, "name">
}

export type TaskWithAsset = Task & {
  assets?: Pick<Asset, "name" | "type"> | null
  users_profile?: Pick<UserProfile, "full_name"> | null
}

export type BookingWithProvider = Booking & {
  providers: Pick<Provider, "name" | "category" | "rating">
  tasks?: Pick<Task, "title"> | null
  users_profile: Pick<UserProfile, "full_name">
}

export type HouseholdWithMembers = Household & {
  rooms: Room[]
  household_members: (HouseholdMember & {
    users_profile: Pick<UserProfile, "full_name"> | null
  })[]
}
