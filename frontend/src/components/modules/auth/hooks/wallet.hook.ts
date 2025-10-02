import { useWalletContext } from "@/providers/wallet.provider";
import { useState } from "react";

export const useWallet = () => {
  // Get wallet info from wallet context
  const { setWalletInfo, clearWalletInfo, walletAddress, walletName } = useWalletContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Handle successful passkey authentication
   */
  const handlePasskeySuccess = async (walletAddress: string, _token: string) => {
    try {
      await setWalletInfo(walletAddress, 'Passkey Wallet');
    } catch (error) {
      throw error;
    }
  };

  /**
   * Disconnect from the passkey wallet and clear the wallet info
   */
  const disconnectWallet = async () => {
    try {
      // Clear backend session cookie
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      await fetch(`${backendUrl}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch {
      // ignore
    } finally {
      clearWalletInfo();
    }
  };

  /**
   * Handle the connection to the wallet by some button click
   */
  const handleConnect = async () => {
    setIsModalOpen(true);
  };

  /**
   * Handle the disconnection to the wallet by some button click
   */
  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
    } catch {
      // Error disconnecting wallet
    }
  };

  /**
   * Sign a message with the passkey wallet
   * Uses the stored auth token for authentication
   */
  const signMessage = async (message: string) => {
    if (!walletAddress) {
      throw new Error('No wallet connected');
    }
    try {
      // Call backend to sign message with server-side wallet
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const resp = await fetch(`${backendUrl}/wallets/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message }),
      });
      if (!resp.ok) throw new Error('Failed to sign message');
      const data = await resp.json();
      return {
        signedMessage: data.signature,
        signerAddress: walletAddress,
      };
    } catch {
      throw new Error('Failed to sign message with passkey wallet');
    }
  };

  return {
    // Main wallet interface
    handleConnect,
    handleDisconnect,
    signMessage,
    isConnected: !!walletAddress,
    walletAddress,
    walletName,

    // Passkey specific
    handlePasskeySuccess,

    // UI state
    isModalOpen,
    setIsModalOpen,
  };
};