"use client";

import React from "react";
import { useWallet } from "@/components/modules/auth/hooks/wallet.hook";
import { useWalletContext } from "@/providers/wallet.provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Wallet,
  Key,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Info,
} from "lucide-react";

export function Dashboard() {
  const { isConnected, walletAddress } = useWallet();
  const { userProfile } = useWalletContext();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const recentActivities = [
    {
      action: isConnected ? "Wallet Connected" : "No Recent Activity",
      time: isConnected ? "Just now" : "-",
      icon: isConnected ? CheckCircle : AlertCircle,
      color: isConnected ? "text-green-600" : "text-gray-400",
    },
    ...(userProfile?.has_api_key
      ? [
          {
            action: "API Key Generated",
            time: "Recently",
            icon: CheckCircle,
            color: "text-green-600",
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-[0_0_14px_rgba(255,255,255,0.25)]">Dashboard</h1>
          <p className="text-white/70 mt-1 text-sm sm:text-base">
            Overview of your ACTA dApp status
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-400/10 backdrop-blur-sm rounded-2xl">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            Live
          </Badge>
        </div>
      </div>

      {/* Status Alert */}
      {!isConnected && (
        <Alert className="bg-[rgba(255,255,255,0.03)] border border-orange-500/20 rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.35)]">
          <Info className="h-4 w-4 text-orange-400" />
          <AlertTitle className="text-orange-400">Wallet Not Connected</AlertTitle>
          <AlertDescription className="text-orange-300/80">
            Connect your Stellar wallet to access all dashboard features and view your account information.
          </AlertDescription>
        </Alert>
      )}

      {isConnected && !userProfile?.has_api_key && (
        <Alert className="bg-[rgba(255,255,255,0.03)] border border-blue-500/20 rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.35)]">
          <Key className="h-4 w-4 text-blue-400" />
          <AlertTitle className="text-blue-400">API Key Recommended</AlertTitle>
          <AlertDescription className="text-blue-300/80">
            Generate an API key to access ACTA services and start creating credentials.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Wallet Information */}
        <Card className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_60px_rgba(0,0,0,0.45)] hover:ring-1 hover:ring-white/10 after:pointer-events-none after:absolute after:inset-0 after:rounded-3xl after:border after:border-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold text-white">Wallet Information</CardTitle>
            <Wallet className="w-5 h-5 text-white/70" />
          </CardHeader>
          <CardContent>
            {isConnected ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/70">
                    Public Key
                  </label>
                  <div className="mt-1 p-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                    <code className="text-sm text-white font-mono">
                      {formatAddress(walletAddress!)}
                    </code>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Network</p>
                    <p className="text-sm text-white/70">Stellar Testnet</p>
                  </div>
                  <Badge className="bg-green-400/20 text-green-400 border-green-400/30 backdrop-blur-sm rounded-2xl">Connected</Badge>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-white/70 mx-auto mb-4" />
                <p className="text-white/70">No wallet connected</p>
                <p className="text-sm text-white/50 mt-1">
                  Connect your Stellar wallet to view information
                </p>
              </div>
            )}
          </CardContent>
          {/* soft inner vignette */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_0_60px_rgba(255,255,255,0.03)]" />
        </Card>

        {/* Recent Activity */}
        <Card className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_60px_rgba(0,0,0,0.45)] hover:ring-1 hover:ring-white/10 after:pointer-events-none after:absolute after:inset-0 after:rounded-3xl after:border after:border-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-semibold text-white">Recent Activity</CardTitle>
            <Clock className="w-5 h-5 text-white/70" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${activity.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {activity.action}
                      </p>
                      <p className="text-xs text-white/70">{activity.time}</p>
                    </div>
                  </div>
                );
              })}

              {recentActivities.length === 1 && !isConnected && (
                <div className="text-center py-4">
                  <p className="text-sm text-white/70">
                    Connect your wallet to see activity
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          {/* soft inner vignette */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_0_60px_rgba(255,255,255,0.03)]" />
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-[rgba(255,255,255,0.03)] border border-white/10 rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_40px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_24px_60px_rgba(0,0,0,0.45)] hover:ring-1 hover:ring-white/10 after:pointer-events-none after:absolute after:inset-0 after:rounded-3xl after:border after:border-white/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-semibold text-white">Quick Actions</CardTitle>
          <TrendingUp className="w-5 h-5 text-white/70" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card className="p-4 bg-[rgba(255,255,255,0.03)] backdrop-blur-sm border border-white/10 rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_20px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_12px_30px_rgba(0,0,0,0.35)] hover:ring-1 hover:ring-white/10">
              <CardContent className="p-0">
                <Key className="w-8 h-8 text-[#1B6BFF] mb-3" />
                <h3 className="text-sm font-semibold text-white mb-1">
                  Generate API Key
                </h3>
                <p className="text-xs text-white/70 mb-3">
                  Create a new API key for ACTA services
                </p>
                <Button size="sm" className="w-full bg-[rgba(255,255,255,0.03)] border border-white/10 text-transparent bg-clip-text bg-[linear-gradient(180deg,#F0E7CC_0%,#E9F8D8_55%,#FFFFFF_100%)] hover:bg-[rgba(255,255,255,0.05)] rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:ring-1 hover:ring-white/10">
                  <span className="text-white">Go to API Key</span>
                </Button>
              </CardContent>
            </Card>

            <Card className="p-4 bg-[rgba(255,255,255,0.03)] backdrop-blur-sm border border-white/10 rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_20px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_12px_30px_rgba(0,0,0,0.35)] hover:ring-1 hover:ring-white/10">
              <CardContent className="p-0">
                <User className="w-8 h-8 text-green-400 mb-3" />
                <h3 className="text-sm font-semibold text-white mb-1">
                  View Profile
                </h3>
                <p className="text-xs text-white/70 mb-3">
                  Check your wallet details and connection
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-green-400/30 text-green-400 hover:bg-green-400/10 backdrop-blur-sm rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>

            <Card className="p-4 bg-[rgba(255,255,255,0.03)] backdrop-blur-sm border border-white/10 rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_20px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_12px_30px_rgba(0,0,0,0.35)] hover:ring-1 hover:ring-white/10">
              <CardContent className="p-0">
                <Activity className="w-8 h-8 text-[#8F43FF] mb-3" />
                <h3 className="text-sm font-semibold text-white mb-1">
                  API Documentation
                </h3>
                <p className="text-xs text-white/70 mb-3">
                  Learn how to integrate ACTA API
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-[#8F43FF]/30 text-[#8F43FF] hover:bg-[#8F43FF]/10 backdrop-blur-sm rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  View Docs
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        {/* soft inner vignette */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_0_60px_rgba(255,255,255,0.03)]" />
      </Card>
    </div>
  );
}
