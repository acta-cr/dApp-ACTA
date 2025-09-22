"use client";

import React from "react";
import Image from "next/image";
import { useWallet } from "@/components/modules/auth/hooks/wallet.hook";
import Sidebar from "@/components/layout/Sidebar";
import { SimplePasskeyModal } from "@/components/modules/auth/ui/SimplePasskeyModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound } from "lucide-react";
import { Particles } from "@/components/magicui/particles";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected, handleConnect, isModalOpen, setIsModalOpen, handlePasskeySuccess } = useWallet();

  // If not connected, show connection screen
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        {/* Background layers */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-[#1B1F2E]" />
          <Particles
            className="absolute inset-0 z-0"
            quantity={60}
            staticity={40}
            ease={70}
            size={0.4}
            vx={0}
            vy={0}
            color="#ffffff"
          />
        </div>

        {/* Connection section */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_60px_rgba(0,0,0,0.45)] hover:ring-1 hover:ring-white/10 after:pointer-events-none after:absolute after:inset-0 after:rounded-3xl after:border after:border-white/5">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Image src="/logo.png" alt="ACTA Logo" width={64} height={64} className="w-16 h-16" />
                </div>
                <CardTitle className="text-3xl font-bold text-white mb-2 drop-shadow-[0_0_14px_rgba(255,255,255,0.25)]">
                  ACTA dApp
                </CardTitle>
                <CardDescription className="text-base text-white/85">
                  Authenticate with your passkey to access your Stellar wallet and dashboard
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button
                  onClick={handleConnect}
                  size="lg"
                  className="w-full h-12 bg-[rgba(255,255,255,0.03)] border border-white/10 text-transparent bg-clip-text bg-[linear-gradient(180deg,#F0E7CC_0%,#E9F8D8_55%,#FFFFFF_100%)] hover:bg-[rgba(255,255,255,0.05)] rounded-2xl font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_60px_rgba(0,0,0,0.45)] hover:ring-1 hover:ring-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
                >
                  <KeyRound className="w-5 h-5 mr-2 text-white" />
                  <span className="text-white">Authenticate with Passkey</span>
                </Button>

                <div className="text-center">
                  <p className="text-xs text-white/70 leading-relaxed">
                    Secure biometric authentication creates your Stellar wallet automatically
                  </p>
                </div>
              </CardContent>

              {/* soft inner vignette */}
              <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_0_60px_rgba(255,255,255,0.03)]" />
            </Card>
          </div>
        </div>

        {/* Simple Passkey Modal */}
        <SimplePasskeyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handlePasskeySuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background layers */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-[#1B1F2E]" />
        <Particles
          className="absolute inset-0 z-0"
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
      <div className="relative z-10">
        <Sidebar>
          {children}
        </Sidebar>
      </div>
    </div>
  );
}