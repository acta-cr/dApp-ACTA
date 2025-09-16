"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CreditCard,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle,
  ExternalLink,
  Key,
  Copy,
  User,
  Building,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { apiService, CredentialContract } from "@/services/api.service";
import { useWallet } from "@/components/modules/auth/hooks/wallet.hook";
import { useWalletContext } from "@/providers/wallet.provider";

export function MyCredentials() {
  const { walletAddress } = useWallet();
  const { userProfile, isLoadingUser } = useWalletContext();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [userCredentials, setUserCredentials] = useState<CredentialContract[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<CredentialContract | null>(null);
  const [detailCardFlipped, setDetailCardFlipped] = useState(false);

  // Load user credentials
  useEffect(() => {
    const loadUserCredentials = async () => {
      if (walletAddress) {
        try {
          const credentials = await apiService.getUserCredentials(walletAddress);
          setUserCredentials(credentials);
        } catch (error) {
          console.error("Error loading user credentials:", error);
          toast.error("Error loading credentials");
        }
      }
    };

    loadUserCredentials();
  }, [walletAddress]);

  // Helper functions for credential display
  const getCredentialGradientClasses = (customization: any) => {
    if (!customization) return "from-blue-500 to-purple-600";

    switch (customization.selectedGradient) {
      case "blue-purple":
        return "from-blue-500 to-purple-600";
      case "green-blue":
        return "from-green-500 to-blue-600";
      case "orange-red":
        return "from-orange-500 to-red-600";
      case "pink-purple":
        return "from-pink-500 to-purple-600";
      default:
        return "from-blue-500 to-purple-600";
    }
  };

  const getCredentialGradientStyle = (customization: any) => {
    if (customization?.selectedGradient === "custom" && customization?.customGradient) {
      return {
        background: `linear-gradient(135deg, ${customization.customGradient.start} 0%, ${customization.customGradient.end} 100%)`,
      };
    }
    return {};
  };

  const getCredentialTemplate = (customization: any) => {
    if (!customization) return null;

    switch (customization.selectedTemplate) {
      case "dots":
        return (
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "20px 20px"
            }} />
          </div>
        );
      case "lines":
        return (
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: "linear-gradient(45deg, transparent 40%, white 50%, transparent 60%)",
              backgroundSize: "20px 20px"
            }} />
          </div>
        );
      case "geometric":
        return (
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: "polygon(50% 0%, 0% 100%, 100% 100%)",
              clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)"
            }} />
          </div>
        );
      default:
        return null;
    }
  };

  const getCredentialLogoComponent = (customization: any) => {
    if (!customization) return <CreditCard className="w-6 h-6" />;

    switch (customization.selectedLogo) {
      case "acta":
        return <CreditCard className="w-6 h-6" />;
      case "shield":
        return <CheckCircle className="w-6 h-6" />;
      case "star":
        return <Sparkles className="w-6 h-6" />;
      case "user":
        return <User className="w-6 h-6" />;
      case "building":
        return <Building className="w-6 h-6" />;
      case "custom":
        if (customization.customLogoUrl) {
          return <img src={customization.customLogoUrl} alt="Logo" className="w-6 h-6 rounded" />;
        }
        return <CreditCard className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  const getCredentialLogoText = (customization: any) => {
    if (!customization) return "ACTA";

    switch (customization.selectedLogo) {
      case "acta":
        return "ACTA";
      case "shield":
        return "SECURE";
      case "star":
        return "PREMIUM";
      case "user":
        return "PERSONAL";
      case "building":
        return "CORPORATE";
      case "custom":
        return customization.customLogoText || "CUSTOM";
      default:
        return "ACTA";
    }
  };

  const openDetailModal = (credential: CredentialContract) => {
    setSelectedCredential(credential);
    setShowDetailModal(true);
    setDetailCardFlipped(false);
  };

  if (isLoadingUser) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          My Credentials
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          View and manage your issued credentials
        </p>
      </div>

      {/* Status Alert */}
      <Alert className="bg-blue-500/10 border-blue-500/20 rounded-2xl">
        <Info className="h-4 w-4" />
        <AlertTitle className="text-blue-400">Credential Management</AlertTitle>
        <AlertDescription className="text-blue-300/80">
          Here you can view all credentials that have been issued to your wallet address. Click on any credential to see detailed information.
        </AlertDescription>
      </Alert>

      {/* My Credentials Section */}
      {userCredentials.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="border-white/20 text-muted-foreground backdrop-blur-sm rounded-2xl">
              {userCredentials.length} credential{userCredentials.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCredentials.map((credential, index) => (
              <Card key={`my-creds-${credential.id}-${index}`} className="group cursor-pointer hover:scale-105 transition-transform bg-background/80 backdrop-blur-xl border-white/10">
                <CardContent
                  className="p-0"
                  onClick={() => openDetailModal(credential)}
                >
                  <div
                    className={`relative w-full h-56 ${credential.customization?.selectedGradient === "custom" ? "" : "bg-gradient-to-br " + getCredentialGradientClasses(credential.customization)} rounded-xl shadow-xl overflow-hidden`}
                    style={getCredentialGradientStyle(credential.customization)}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      {getCredentialTemplate(credential.customization)}
                    </div>

                    {/* Card Content */}
                    <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCredentialLogoComponent(credential.customization)}
                          <span className="text-sm font-medium">
                            {getCredentialLogoText(credential.customization)}
                          </span>
                        </div>
                        <CreditCard className="w-6 h-6" />
                      </div>

                      {/* Middle Content */}
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-blue-200 uppercase tracking-wide">
                            Holder
                          </p>
                          <p className="text-lg font-semibold truncate">
                            {credential.holder || "Unknown Holder"}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-blue-200 uppercase tracking-wide">
                              Category
                            </p>
                            <p className="text-sm font-medium truncate">
                              {credential.category || "General"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-blue-200 uppercase tracking-wide">
                              Expires
                            </p>
                            <p className="text-sm font-medium">
                              {credential.expiresAt
                                ? new Date(credential.expiresAt).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-blue-200 uppercase tracking-wide">
                            Issued By
                          </p>
                          <p className="text-sm font-medium">
                            {credential.issuedBy || "ACTA"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs">Verified</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="bg-background/80 backdrop-blur-xl border-white/10">
          <CardContent className="text-center py-12">
            <CreditCard className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Credentials Yet
            </h3>
            <p className="text-muted-foreground mb-6">
              You haven&apos;t received any credentials yet. Credentials will appear here when they are issued to your wallet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}