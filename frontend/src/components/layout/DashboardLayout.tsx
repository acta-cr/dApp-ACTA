"use client";

import React, { useState } from "react";
import { useWallet } from "@/components/modules/auth/hooks/wallet.hook";
import { Sidebar } from "./Sidebar";
import { Dashboard } from "@/components/modules/dashboard/Dashboard";
import { Profile } from "@/components/modules/profile/Profile";
import { ApiKey } from "@/components/modules/api-key/ApiKey";
import { CreateCredential } from "@/components/modules/credentials/CreateCredential";
import { SearchCredential } from "@/components/modules/credentials/SearchCredential";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import Aurora from "@/components/Aurora";
import { Particles } from "@/components/magicui/particles";

type SectionType = "dashboard" | "profile" | "api-key" | "credentials" | "my-credentials" | "search-credential";

export function DashboardLayout() {
  const { isConnected, handleConnect } = useWallet();
  const [activeSection, setActiveSection] = useState<SectionType>("dashboard");

  // If not connected, show connection screen
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-background to-slate-800 text-foreground overflow-x-hidden">
        {/* Background layers */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-background/80 to-slate-800/50" />
          <Aurora />
          <Particles
            className="absolute inset-0 z-10"
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
        <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="bg-card/50 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo.png" alt="ACTA Logo" className="w-16 h-16" />
                </div>
                <CardTitle className="text-3xl font-bold text-foreground mb-2">
                  ACTA dApp
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Connect your Stellar wallet to access the dashboard and generate API keys
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <Button
                  onClick={handleConnect}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/40 w-full h-12"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect Stellar Wallet
                </Button>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground/80 leading-relaxed">
                    Supports Freighter, Albedo, xBull, Lobstr, and Rabet wallets
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "profile":
        return <Profile />;
      case "api-key":
        return <ApiKey />;
      case "credentials":
        return <CreateCredential />;
      case "my-credentials":
        return <CreateCredential showOnlyMyCredentials={true} />;
      case "search-credential":
        return <SearchCredential />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-background to-slate-800 text-foreground">
      {/* Background layers */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-background/80 to-slate-800/50" />
        <Aurora />
        <Particles
          className="absolute inset-0 z-10"
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
      <div className="relative z-20">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        >
          {renderActiveSection()}
        </Sidebar>
      </div>
    </div>
  );
}
