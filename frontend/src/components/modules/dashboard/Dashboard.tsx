"use client";

import React from "react";
import { useWallet } from "@/components/modules/auth/hooks/wallet.hook";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Wallet,
  Activity,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  User,
  Info,
} from "lucide-react";

export function Dashboard() {
  const { isConnected, walletAddress } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const recentActivities = [
    {
      action: isConnected ? "Wallet Connected" : "No Recent Activity",
      time: isConnected ? "Just now" : "-",
      icon: isConnected ? CheckCircle : AlertCircle,
      color: isConnected ? "text-green-600" : "text-muted-foreground",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 ">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your ACTA dApp status
          </p>
        </div>
        <Badge
          variant="outline"
          className="w-fit border-[#F0E7CC]/30 text-[#F0E7CC]"
        >
          <div className="w-2 h-2 bg-[#F0E7CC] rounded-full mr-2"></div>
          Live
        </Badge>
      </div>

      {/* Status Alerts */}
      {!isConnected && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Wallet Not Connected</AlertTitle>
          <AlertDescription>
            Connect your Stellar wallet to access all dashboard features and
            view your account information.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 gap-6">
        {/* Wallet Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center text-foreground">
              <Wallet className="w-4 h-4 mr-2 text-[#F0E7CC]" />
              Wallet Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isConnected ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Public Key
                  </label>
                  <div className="flex items-center justify-between mt-1">
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {formatAddress(walletAddress!)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigator.clipboard.writeText(walletAddress!)
                      }
                      className="h-8 px-2"
                    >
                      <Activity className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="flex items-center mt-1">
                    <CheckCircle className="w-4 h-4 mr-2 text-[#F0E7CC]" />
                    <span className="text-sm">Connected</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No wallet connected
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center text-foreground">
              <Activity className="w-4 h-4 mr-2 text-[#F0E7CC]" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <activity.icon className={`w-4 h-4 ${activity.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center text-foreground">
              <TrendingUp className="w-4 h-4 mr-2 text-[#F0E7CC]" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold">
                  {isConnected ? "1" : "0"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Wallets Connected
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold">0</div>
                <div className="text-xs text-muted-foreground">Credentials</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center text-foreground">
              <User className="w-4 h-4 mr-2 text-[#F0E7CC]" />
              Account Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Account Type
                </span>
                <Badge variant="secondary" className="text-xs">
                  Standard
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Member Since
                </span>
                <span className="text-sm">Today</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Last Activity
                </span>
                <span className="text-sm">{isConnected ? "Now" : "Never"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
