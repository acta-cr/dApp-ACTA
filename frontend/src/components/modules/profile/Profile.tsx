"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@/components/modules/auth/hooks/wallet.hook";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Wallet,
  Copy,
  Check,
  Info,
  ExternalLink,
  Settings,
  Shield,
  Eye,
  EyeOff,
  Key,
} from "lucide-react";
// Backend driven profile; no local secret reconstruction

export function Profile() {
  const { isConnected, walletAddress } = useWallet();
  const [copied, setCopied] = useState(false);
  const [credentialIds, setCredentialIds] = useState<string[]>([]);

  // Load passkey list from backend
  useEffect(() => {
    const loadWalletInfo = async () => {
      if (isConnected && walletAddress) {
        try {
          const backendUrl =
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
          const resp = await fetch(`${backendUrl}/credentials/passkeys`, {
            credentials: "include",
          });
          if (resp.ok) {
            const data = await resp.json();
            type PasskeyItem = { credential_id?: string };
            const ids = ((data.items || []) as PasskeyItem[])
              .map(p => p.credential_id)
              .filter((id): id is string => Boolean(id));
            setCredentialIds(ids);
          }
        } catch {
          // ignore
        }
      }
    };

    loadWalletInfo();
  }, [isConnected, walletAddress]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Failed to copy text
    }
  };

  // No secret key toggle; secrets remain on backend only

  if (!isConnected) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Your wallet information and connection details
          </p>
        </div>

        <Alert className="bg-orange-500/10 border-orange-500/20 rounded-2xl">
          <Wallet className="h-4 w-4" />
          <AlertTitle className="text-orange-400">
            Wallet Connection Required
          </AlertTitle>
          <AlertDescription className="text-orange-300/80">
            Connect your Stellar wallet to view your profile information and
            manage your account.
          </AlertDescription>
        </Alert>

        <Card className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                <Wallet className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl mb-2">
                No Wallet Connected
              </CardTitle>
              <CardDescription className="mb-6">
                Connect your Stellar wallet to view your profile information and
                manage your account.
              </CardDescription>
              <Button
                variant="default"
                className="bg-black text-white hover:bg-gray-800 rounded-2xl h-12 px-6 font-semibold shadow-lg transition-all border-2 border-[#F0E7CC]/40 hover:border-[#F0E7CC]/60 golden-border-animated"
              >
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Your wallet information and connection details
        </p>
      </div>

      {/* Main Profile Card */}
      <Card className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="h-20 w-20 border-2 border-[#F0E7CC] shadow-[0_0_10px_rgba(240,231,204,0.3)]">
              <AvatarFallback className="bg-black text-foreground text-xl font-bold">
                {walletAddress?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {walletAddress
                    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}`
                    : "Stellar Wallet"}
                </h2>
                <p className="text-muted-foreground">Connected to ACTA dApp</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className="bg-[#F0E7CC]/20 text-foreground border-[#F0E7CC]/30 backdrop-blur-sm rounded-2xl">
                  <div className="w-2 h-2 bg-[#F0E7CC] rounded-full mr-2"></div>
                  Connected
                </Badge>
                <Badge
                  variant="outline"
                  className="border-white/20 text-muted-foreground backdrop-blur-sm rounded-2xl"
                >
                  Testnet
                </Badge>
                <Badge
                  variant="outline"
                  className="border-white/20 text-muted-foreground backdrop-blur-sm rounded-2xl"
                >
                  Verified
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-background/60 backdrop-blur-xl border border-white/10 rounded-2xl">
          <TabsTrigger
            value="details"
            className="data-[state=active]:bg-white/10 rounded-xl"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Wallet Details
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="data-[state=active]:bg-white/10 rounded-xl"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="space-y-4 sm:space-y-6">
            <Card className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center text-foreground">
                  <Wallet className="w-5 h-5 mr-2 text-[#F0E7CC]" />
                  Wallet Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Public Key */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center mb-2">
                    <Info className="w-4 h-4 mr-1" />
                    Public Key
                  </label>
                  <div className="flex items-center space-x-3 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                    <code className="flex-1 text-sm text-foreground font-mono break-all">
                      {walletAddress
                        ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`
                        : ""}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(walletAddress!)}
                      className="flex-shrink-0"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Your Stellar public key used for identification and
                    transactions
                  </p>
                </div>

                {/* Secret Key removed: managed securely on backend */}

                {/* Passkey Information */}
                {credentialIds.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center mb-2">
                      <Shield className="w-4 h-4 mr-1" />
                      Passkey Information
                    </label>
                    <div className="space-y-3">
                      {credentialIds.map(cid => (
                        <div
                          key={cid}
                          className="flex justify-between items-center p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
                        >
                          <span className="text-sm text-muted-foreground">
                            Credential ID
                          </span>
                          <div className="flex items-center space-x-2">
                            <code className="text-xs text-foreground bg-white/5 backdrop-blur-sm px-2 py-1 rounded border border-white/10 max-w-xs truncate">
                              {cid.slice(0, 8)}...{cid.slice(-8)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(cid)}
                            >
                              {copied ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stellar Expert Links */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center mb-2">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Wallet Explorer
                  </label>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-[#F0E7CC]/30 text-foreground hover:bg-[#F0E7CC]/10 backdrop-blur-sm rounded-lg"
                      onClick={() =>
                        window.open(
                          `https://stellar.expert/explorer/testnet/account/${walletAddress}`,
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Testnet
                    </Button>
                    <p className="text-xs text-muted-foreground/70">
                      Check your balance, transaction history, and account
                      details
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Wallet Settings
              </CardTitle>
              <CardDescription>
                Manage your wallet preferences and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-[#F0E7CC]/10 border-[#F0E7CC]/20 rounded-2xl">
                <Info className="h-4 w-4" />
                <AlertTitle className="text-foreground">
                  Settings Available
                </AlertTitle>
                <AlertDescription className="text-foreground/80">
                  Additional wallet settings and preferences will be available
                  in future updates.
                </AlertDescription>
              </Alert>

              <Card className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Having issues with your wallet connection or need
                    assistance?
                  </p>

                  <Button
                    variant="outline"
                    className="w-full justify-start border-white/20 text-foreground hover:bg-white/5 backdrop-blur-sm rounded-2xl"
                    onClick={() =>
                      window.open("https://docs.acta.build", "_blank")
                    }
                  >
                    <Info className="w-4 h-4 mr-2" />
                    View Documentation
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
