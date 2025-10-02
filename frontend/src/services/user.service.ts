// User profile type used across the app
export type UserProfile = {
  wallet_address: string;
  created_at: string;
};

export class UserService {
  /**
   * Register or get user by wallet address
   */
  async registerUser(walletAddress: string): Promise<UserProfile> {
    // Try to fetch profile from backend session
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const resp = await fetch(`${backendUrl}/wallets/me?ts=${Date.now()}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!resp.ok && resp.status === 304) {
        // Retry with new timestamp to bypass caches
        const retry = await fetch(`${backendUrl}/wallets/me?ts=${Date.now() + 1}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (retry.ok) {
          const data = await retry.json();
          const addr = data.walletAddress || walletAddress;
          return {
            wallet_address: addr,
            created_at: new Date().toISOString(),
          };
        }
      }
      if (resp.ok) {
        const data = await resp.json();
        const addr = data.walletAddress || walletAddress;
        return {
          wallet_address: addr,
          created_at: new Date().toISOString(),
        };
      }
    } catch {
      // ignore and fallback
    }
    // Fallback minimal profile
    return {
      wallet_address: walletAddress,
      created_at: new Date().toISOString(),
    };
  }

  /**
   * Get user profile by wallet address
   */
  async getUserProfile(walletAddress: string): Promise<UserProfile | null> {
    // Try to fetch profile from backend session
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const resp = await fetch(`${backendUrl}/wallets/me?ts=${Date.now()}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!resp.ok && resp.status === 304) {
        const retry = await fetch(`${backendUrl}/wallets/me?ts=${Date.now() + 1}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (retry.ok) {
          const data = await retry.json();
          const addr = data.walletAddress || walletAddress;
          return {
            wallet_address: addr,
            created_at: new Date().toISOString(),
          };
        }
      }
      if (resp.ok) {
        const data = await resp.json();
        const addr = data.walletAddress || walletAddress;
        return {
          wallet_address: addr,
          created_at: new Date().toISOString(),
        };
      }
    } catch {
      // ignore and fallback
    }
    // Fallback minimal profile
    return {
      wallet_address: walletAddress,
      created_at: new Date().toISOString(),
    };
  }
}

export const userService = new UserService();
