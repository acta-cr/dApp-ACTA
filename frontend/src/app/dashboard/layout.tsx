"use client";

import React from "react";
import { useWallet } from "@/components/modules/auth/hooks/wallet.hook";
import Sidebar from "@/components/layout/Sidebar";
import { Particles } from "@/components/magicui/particles";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected } = useWallet();
  const router = useRouter();

  // If not connected, redirect to login
  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  // If not connected but not redirected yet, show loading
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-[#1B1F2E]" />
          <Particles
            className="absolute inset-0 z-[1]"
            quantity={60}
            staticity={40}
            ease={70}
            size={0.4}
            vx={0}
            vy={0}
            color="#ffffff"
          />
        </div>
        <div className="relative z-[5] flex items-center justify-center p-4 min-h-screen">
          <div className="text-center text-white">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background layers */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-[#1B1F2E]" />
        <Particles
          className="absolute inset-0 z-[1]"
          quantity={60}
          staticity={40}
          ease={70}
          size={0.4}
          vx={0}
          vy={0}
          color="#ffffff"
        />
      </div>

      {/* Main container */}
      <div className="relative z-[5]">
        <Sidebar>
          {children}
        </Sidebar>
      </div>
    </div>
  );
}