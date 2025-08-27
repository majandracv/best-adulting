// TypeScript types for Best Adulting database schema
// Generated from Supabase schema

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users_profile: {
        Row: {
          user_id: string
          full_name: string | null
          locale: string | null
          tier: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          full_name?: string | null
          locale?: string | null
          tier?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          full_name?: string | null
          locale?: string | null
          tier?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      households: {
        Row: {
          id: string
          owner_id: string
          name: string
          zip: string | null
          home_type: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          zip?: string | null
          home_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          zip?: string | null
          home_type?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      household_members: {
        Row: {
          id: string
          household_id: string
          user_id: string
          role: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          user_id: string
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          user_id?: string
          role?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          id: string
          household_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_household_id_fkey"
            columns: ["household_id"]
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          id: string
          room_id: string
          household_id: string
          name: string
          type: string | null
          brand: string | null
          model: string | null
          serial: string | null
          purchase_date: string | null
          warranty_expiry: string | null
          photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          household_id: string
          name: string
          type?: string | null
          brand?: string | null
          model?: string | null
          serial?: string | null
          purchase_date?: string | null
          warranty_expiry?: string | null
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          household_id?: string
          name?: string
          type?: string | null
          brand?: string | null
          model?: string | null
          serial?: string | null
          purchase_date?: string | null
          warranty_expiry?: string | null
          photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_household_id_fkey"
            columns: ["household_id"]
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_room_id_fkey"
            columns: ["room_id"]
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          id: string
          asset_id: string | null
          household_id: string
          title: string
          instructions: string | null
          frequency_type: string | null
          frequency_value: number | null
          next_due: string | null
          assigned_to: string | null
          is_archived: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          asset_id?: string | null
          household_id: string
          title: string
          instructions?: string | null
          frequency_type?: string | null
          frequency_value?: number | null
          next_due?: string | null
          assigned_to?: string | null
          is_archived?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          asset_id?: string | null
          household_id?: string
          title?: string
          instructions?: string | null
          frequency_type?: string | null
          frequency_value?: number | null
          next_due?: string | null
          assigned_to?: string | null
          is_archived?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_asset_id_fkey"
            columns: ["asset_id"]
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_household_id_fkey"
            columns: ["household_id"]
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      task_logs: {
        Row: {
          id: string
          task_id: string
          household_id: string
          user_id: string
          completed_at: string | null
          time_spent_min: number | null
          notes: string | null
          cost_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          household_id: string
          user_id: string
          completed_at?: string | null
          time_spent_min?: number | null
          notes?: string | null
          cost_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          household_id?: string
          user_id?: string
          completed_at?: string | null
          time_spent_min?: number | null
          notes?: string | null
          cost_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_logs_cost_id_fkey"
            columns: ["cost_id"]
            referencedRelation: "costs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_logs_household_id_fkey"
            columns: ["household_id"]
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_logs_task_id_fkey"
            columns: ["task_id"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      costs: {
        Row: {
          id: string
          household_id: string
          category: string | null
          vendor: string | null
          amount_cents: number
          currency: string | null
          receipt_url: string | null
          linked_task_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          household_id: string
          category?: string | null
          vendor?: string | null
          amount_cents: number
          currency?: string | null
          receipt_url?: string | null
          linked_task_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          household_id?: string
          category?: string | null
          vendor?: string | null
          amount_cents?: number
          currency?: string | null
          receipt_url?: string | null
          linked_task_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "costs_household_id_fkey"
            columns: ["household_id"]
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "costs_linked_task_id_fkey"
            columns: ["linked_task_id"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          id: string
          category: string
          name: string
          rating: number | null
          phone: string | null
          url: string | null
          geo_point: unknown | null
          owner_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: string
          name: string
          rating?: number | null
          phone?: string | null
          url?: string | null
          geo_point?: unknown | null
          owner_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: string
          name?: string
          rating?: number | null
          phone?: string | null
          url?: string | null
          geo_point?: unknown | null
          owner_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          id: string
          provider_id: string
          household_id: string
          task_id: string | null
          requester_id: string
          starts_at: string
          ends_at: string | null
          status: string | null
          notes: string | null
          price_cents: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          household_id: string
          task_id?: string | null
          requester_id: string
          starts_at: string
          ends_at?: string | null
          status?: string | null
          notes?: string | null
          price_cents?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          household_id?: string
          task_id?: string | null
          requester_id?: string
          starts_at?: string
          ends_at?: string | null
          status?: string | null
          notes?: string | null
          price_cents?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_household_id_fkey"
            columns: ["household_id"]
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_task_id_fkey"
            columns: ["task_id"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          id: string
          sku_hint: string | null
          title: string
          unit: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sku_hint?: string | null
          title: string
          unit?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sku_hint?: string | null
          title?: string
          unit?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_offers: {
        Row: {
          id: string
          product_id: string
          retailer: string
          price_cents: number
          url: string | null
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          retailer: string
          price_cents: number
          url?: string | null
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          retailer?: string
          price_cents?: number
          url?: string | null
          updated_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_offers_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_households: {
        Row: {
          id: string | null
          owner_id: string | null
          name: string | null
          zip: string | null
          home_type: string | null
          created_at: string | null
          updated_at: string | null
          user_role: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_household_member: {
        Args: {
          household_uuid: string
        }
        Returns: boolean
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}
