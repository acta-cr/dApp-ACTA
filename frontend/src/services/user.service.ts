import {
  supabase,
  isSupabaseConfigured,
  type UserProfile,
} from "../lib/supabase";
import { nanoid } from "nanoid";

// Re-export types for use in other modules
export type { UserProfile };

export class UserService {
  private isConfigured = isSupabaseConfigured();

  private handleSupabaseNotConfigured(): UserProfile {
    console.warn("Supabase is not configured. Using mock user profile.");
    return {
      wallet_address: "mock-wallet",
      has_api_key: false,
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
          has_api_key: !!existingUser.api_key,
          api_key: existingUser.api_key,
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
        has_api_key: false,
        created_at: newUser.created_at,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate API key for user
   */
  async generateApiKey(walletAddress: string): Promise<string> {
    const apiKey = `spk_test_${nanoid(32)}`;

    if (!this.isConfigured || !supabase) {
      console.warn("Supabase not configured. Returning mock API key.");
      return apiKey;
    }

    try {

      // Hash the API key for storage (simple hash for demo)
      const apiKeyHash =
        typeof window !== "undefined"
          ? btoa(apiKey) // Browser environment
          : Buffer.from(apiKey).toString("base64"); // Node.js environment


      // Update user with API key
      const { error } = await supabase
        .from("users")
        .update({
          api_key: apiKey,
          api_key_hash: apiKeyHash,
          updated_at: new Date().toISOString(),
        })
        .eq("wallet_address", walletAddress)
        .select();

      if (error) {
        throw new Error("Failed to generate API key");
      }


      return apiKey;
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
        has_api_key: !!user.api_key,
        api_key: user.api_key,
        created_at: user.created_at,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate API key exists for user
   */
  async validateUserApiKey(walletAddress: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(walletAddress);
      return profile?.has_api_key ?? false;
    } catch {
      return false;
    }
  }

  /**
   * Revoke API key for user
   */
  async revokeApiKey(walletAddress: string): Promise<void> {
    if (!this.isConfigured || !supabase) {
      console.warn("Supabase not configured. Mock API key revocation.");
      return;
    }

    try {

      const { error } = await supabase
        .from("users")
        .update({
          api_key: null,
          api_key_hash: null,
          updated_at: new Date().toISOString(),
        })
        .eq("wallet_address", walletAddress)
        .select();

      if (error) {
        throw new Error("Failed to revoke API key");
      }

    } catch (error) {
      throw error;
    }
  }
}

export const userService = new UserService();
