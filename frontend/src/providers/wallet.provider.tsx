"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userService, type UserProfile } from '@/services/user.service';

type WalletContextType = {
  walletAddress: string | null;
  walletName: string | null;
  userProfile: UserProfile | null;
  isLoadingUser: boolean;
  setWalletInfo: (address: string, name: string) => void;
  clearWalletInfo: () => void;
  refreshUserProfile: () => Promise<void>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  // Load wallet info from localStorage on mount
  useEffect(() => {
    const storedAddress = localStorage.getItem("walletAddress");
    const storedName = localStorage.getItem("walletName");

    if (storedAddress) {
      setWalletAddress(storedAddress);
      // Register/load user profile when wallet is restored
      loadUserProfile(storedAddress);
    }
    if (storedName) setWalletName(storedName);
  }, []);

  // Load user profile from Supabase
  const loadUserProfile = async (address: string) => {
    try {
      setIsLoadingUser(true);
      const profile = await userService.registerUser(address);
      setUserProfile(profile);
    } catch {
      // Error loading user profile
    } finally {
      setIsLoadingUser(false);
    }
  };

  /**
   * Set wallet info
   * @param address - Wallet address
   * @param name - Wallet name
   */
  const setWalletInfo = async (address: string, name: string) => {
    setWalletAddress(address);
    setWalletName(name);
    localStorage.setItem("walletAddress", address);
    localStorage.setItem("walletName", name);
    
    // Register/load user profile
    await loadUserProfile(address);
  };

  /**
   * Clear wallet info
   */
  const clearWalletInfo = () => {
    setWalletAddress(null);
    setWalletName(null);
    setUserProfile(null);
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("walletName");
  };

  /**
   * Refresh user profile from database
   */
  const refreshUserProfile = async (): Promise<void> => {
    if (!walletAddress) return;
    await loadUserProfile(walletAddress);
  };

  return (
    <WalletContext.Provider
      value={{ 
        walletAddress, 
        walletName, 
        userProfile,
        isLoadingUser,
        setWalletInfo, 
        clearWalletInfo,
        refreshUserProfile
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletContext must be used within WalletProvider");
  }
  return context;
};