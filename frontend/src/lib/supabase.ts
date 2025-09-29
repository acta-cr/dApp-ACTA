import { createClient } from '@supabase/supabase-js'

// Define the UserProfile type that matches the usage in user.service.ts
export interface UserProfile {
  wallet_address: string
  created_at: string
}

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== '')
}

// Create Supabase client only if configured
export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Database types for better type safety
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          updated_at?: string
        }
      }
    }
  }
}

// Type-safe Supabase client
export type SupabaseClient = ReturnType<typeof createClient<Database>>