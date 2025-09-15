import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Create Supabase client with fallback values
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL && 
         process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co' &&
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here'
}

export interface User {
  id: string
  wallet_address: string
  api_key?: string
  api_key_hash?: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  wallet_address: string
  has_api_key: boolean
  api_key?: string
  created_at?: string
}