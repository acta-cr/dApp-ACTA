import { useWalletContext } from "@/providers/wallet.provider";
import { useState } from "react";

export const useWallet = () => {
  // Get wallet info from wallet context
  const { setWalletInfo, clearWalletInfo, walletAddress, walletName } = useWalletContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Handle successful passkey authentication
   */
  const handlePasskeySuccess = async (walletAddress: string, token: string) => {
    try {
      // Store the auth token and set wallet info
      localStorage.setItem('authToken', token);
      await setWalletInfo(walletAddress, 'Passkey Wallet');
    } catch (error) {
      throw error;
    }
  };

  /**
   * Disconnect from the passkey wallet and clear the wallet info
   */
  const disconnectWallet = async () => {
    localStorage.removeItem('authToken');
    clearWalletInfo();
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

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      throw new Error('No authentication token found. Please log in again.');
    }

    try {
      // For passkey wallets, we simulate message signing using the auth token
      // In a real implementation, this would involve the backend API
      const signature = `passkey_signature_${walletAddress}_${message}_${Date.now()}`;

      return {
        signedMessage: signature,
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