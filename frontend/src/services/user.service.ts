import {
  supabase,
  isSupabaseConfigured,
  type UserProfile,
} from "../lib/supabase";

// Re-export types for use in other modules
export type { UserProfile };

export class UserService {
  private isConfigured = isSupabaseConfigured();

  private handleSupabaseNotConfigured(): UserProfile {
    console.warn("Supabase is not configured. Using mock user profile.");
    return {
      wallet_address: "mock-wallet",
      created_at: new Date().toISOString(),
    };
  }
  /**
   * Register or get user by wallet address
   */
  async registerUser(walletAddress: string): Promise<UserProfile> {
    if (!this.isConfigured || !supabase) {
      return {
        ...this.handleSupabaseNotConfigured(),
        wallet_address: walletAddress,
      };
    }

    try {
      // First check if user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", walletAddress)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 = not found
        throw new Error("Failed to fetch user data");
      }

      if (existingUser) {
        // User exists, return profile
        return {
          wallet_address: existingUser.wallet_address,
          created_at: existingUser.created_at,
        };
      }

      // User doesn't exist, create new one
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            wallet_address: walletAddress,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw new Error("Failed to create user");
      }

      return {
        wallet_address: newUser.wallet_address,
        created_at: newUser.created_at,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user profile by wallet address
   */
  async getUserProfile(walletAddress: string): Promise<UserProfile | null> {
    if (!this.isConfigured || !supabase) {
      return {
        ...this.handleSupabaseNotConfigured(),
        wallet_address: walletAddress,
      };
    }

    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", walletAddress)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Not found
          return null;
        }
        throw new Error("Failed to fetch user profile");
      }

      return {
        wallet_address: user.wallet_address,
        created_at: user.created_at,
      };
    } catch (error) {
      throw error;
    }
  }
}

export const userService = new UserService();
