"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CardContent } from "@/components/ui/card";
import {
  CreditCard,
  Sparkles,
  User,
  Building,
  Eye,
  EyeOff,
  CheckCircle,
  Shield,
  ExternalLink,
  AlertCircle,
  Key,
  Copy,
  FileText,
  Loader2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";
import { apiService, CredentialContract } from "@/services/api.service";
import { useWallet } from "@/components/modules/auth/hooks/wallet.hook";
import { useWalletContext } from "@/providers/wallet.provider";
import { useSimplePasskey } from "@/hooks/use-simple-passkey";
import { ShimmerButton } from "@/components/ui/shimmer-button";

interface CredentialData {
  holder: string;
  issuedBy: string;
  issuedOn: string;
  expires: string;
  category: string;
  description: string;
}

interface CreateCredentialProps {
  showOnlyMyCredentials?: boolean;
}

export function CreateCredential({
  showOnlyMyCredentials = false,
}: CreateCredentialProps = {}) {
  const { walletAddress } = useWallet();
  const { userProfile, isLoadingUser } = useWalletContext();
  const { authenticate, isLoading: isAuthenticating } = useSimplePasskey();
  const [credentialData, setCredentialData] = useState<CredentialData>({
    holder: "",
    issuedBy: "ACTA",
    issuedOn: new Date().toLocaleDateString(),
    expires: "",
    category: "",
    description: "",
  });
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdContract, setCreatedContract] =
    useState<CredentialContract | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [userCredentials, setUserCredentials] = useState<CredentialContract[]>(
    []
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCredential, setSelectedCredential] =
    useState<CredentialContract | null>(null);
  const [detailCardFlipped, setDetailCardFlipped] = useState(false);

  // Customization states
  const [selectedGradient, setSelectedGradient] =
    useState<string>("blue-purple");
  const [selectedLogo, setSelectedLogo] = useState<string>("acta");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("classic");
  const [customGradient, setCustomGradient] = useState<{
    start: string;
    end: string;
  }>({ start: "#3b82f6", end: "#7c3aed" });
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [customLogoUrl, setCustomLogoUrl] = useState<string>("");
  const [customLogoText, setCustomLogoText] = useState<string>("");

  // Load customization settings on component mount
  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem("credentialCustomization");
      if (saved) {
        try {
          const settings = JSON.parse(saved);
          setSelectedGradient(settings.selectedGradient || "blue-purple");
          setSelectedLogo(settings.selectedLogo || "acta");
          setSelectedTemplate(settings.selectedTemplate || "classic");
          setCustomGradient(
            settings.customGradient || { start: "#3b82f6", end: "#7c3aed" }
          );
          setCustomLogoUrl(settings.customLogoUrl || "");
          setCustomLogoText(settings.customLogoText || "");
        } catch (error) {
          console.warn("Error loading customization settings:", error);
        }
      } else {
      }
    };
    loadSettings();
  }, []);

  // Save settings whenever they change (debounced)
  useEffect(() => {
    const saveSettings = () => {
      const settings = {
        selectedGradient,
        selectedLogo,
        selectedTemplate,
        customGradient,
        customLogoUrl,
        customLogoText,
      };
      try {
        localStorage.setItem(
          "credentialCustomization",
          JSON.stringify(settings)
        );
      } catch (error) {
        console.warn("Error saving customization settings:", error);
      }
    };

    // Debounce the save operation
    const timeoutId = setTimeout(saveSettings, 300);
    return () => clearTimeout(timeoutId);
  }, [
    selectedGradient,
    selectedLogo,
    selectedTemplate,
    customGradient,
    customLogoUrl,
    customLogoText,
  ]);

  // Check if user has API key when user profile loads
  useEffect(() => {
    if (userProfile && !userProfile.has_api_key) {
      toast.error("API Key Required", {
        description: "Generate an API key first.",
      });
    }
  }, [userProfile]);

  // API health check disabled to prevent console errors
  // The app works fine in offline mode without health checks

  // Load user credentials when wallet and API key are available
  useEffect(() => {
    const loadUserCredentials = async () => {
      if (walletAddress && userProfile?.has_api_key && userProfile.api_key) {
        try {
          // For now, store credentials locally since we need to implement the API endpoint
          const stored = localStorage.getItem(`credentials_${walletAddress}`);
          if (stored) {
            setUserCredentials(JSON.parse(stored));
          }
        } catch (error) {
          // Error loading user credentials
        }
      }
    };

    loadUserCredentials();
  }, [walletAddress, userProfile]);

  const handleInputChange = (field: keyof CredentialData, value: string) => {
    setCredentialData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const openDetailModal = (credential: CredentialContract) => {
    setSelectedCredential(credential);
    setDetailCardFlipped(false);
    setShowDetailModal(true);
  };

  // Get gradient classes or style based on selection
  const getGradientClasses = (gradient: string): string => {
    switch (gradient) {
      case "emerald-teal":
        return "from-emerald-600 via-teal-600 to-cyan-800";
      case "rose-red":
        return "from-rose-600 via-pink-600 to-red-800";
      case "amber-orange":
        return "from-amber-600 via-orange-600 to-red-800";
      case "gray-slate":
        return "from-gray-600 via-slate-600 to-gray-800";
      case "blue-purple":
      default:
        return "from-blue-600 via-purple-600 to-indigo-800";
    }
  };

  // Get gradient style for custom colors
  const getGradientStyle = (gradient: string) => {
    if (gradient === "custom") {
      return {
        background: `linear-gradient(135deg, ${customGradient.start} 0%, ${customGradient.end} 100%)`,
      };
    }
    return {};
  };

  // Get logo component based on selection
  const getLogoComponent = (logo: string) => {
    switch (logo) {
      case "shield":
        return <Shield className="w-8 h-8 text-[#F0E7CC]" />;
      case "custom-image":
        return customLogoUrl ? (
          <Image
            src={customLogoUrl}
            alt="Custom Logo"
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
        ) : (
          <Image
            src="/white.png"
            alt="ACTA"
            width={32}
            height={32}
            className="w-8 h-8"
          />
        );
      case "custom-text":
        return (
          <span className="text-lg font-bold">{customLogoText || "LOGO"}</span>
        );
      case "acta":
      default:
        return (
          <Image
            src="/white.png"
            alt="ACTA"
            width={32}
            height={32}
            className="w-8 h-8"
          />
        );
    }
  };

  // Get logo text based on selection
  const getLogoText = (logo: string) => {
    // Always show custom text if it exists and is not empty, regardless of logo type
    if (customLogoText && customLogoText.trim() !== "") {
      return customLogoText;
    }

    // Fallback to default text based on logo type
    switch (logo) {
      case "custom-text":
        return "LOGO";
      case "shield":
        return "ACTA";
      case "custom-image":
        return "ACTA";
      case "acta":
      default:
        return "ACTA";
    }
  };

  // Handle custom logo file upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        setCustomLogoUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper functions for credential list styling
  const getCredentialGradientClasses = (
    customization:
      | {
          selectedGradient?: string;
          customGradient?: { start: string; end: string };
          selectedLogo?: string;
          customLogoUrl?: string;
          customLogoText?: string;
          selectedTemplate?: string;
        }
      | null
      | undefined
  ): string => {
    const gradient = customization?.selectedGradient || "blue-purple";
    switch (gradient) {
      case "emerald-teal":
        return "from-emerald-600 via-teal-600 to-cyan-800";
      case "rose-red":
        return "from-rose-600 via-pink-600 to-red-800";
      case "amber-orange":
        return "from-amber-600 via-orange-600 to-red-800";
      case "gray-slate":
        return "from-gray-600 via-slate-600 to-gray-800";
      case "blue-purple":
      default:
        return "from-blue-600 via-purple-600 to-indigo-800";
    }
  };

  const getCredentialGradientStyle = (
    customization:
      | {
          selectedGradient?: string;
          customGradient?: { start: string; end: string };
        }
      | null
      | undefined
  ) => {
    if (
      customization?.selectedGradient === "custom" &&
      customization?.customGradient
    ) {
      return {
        background: `linear-gradient(135deg, ${customization.customGradient.start} 0%, ${customization.customGradient.end} 100%)`,
      };
    }
    return {};
  };

  const getCredentialLogoComponent = (
    customization:
      | {
          selectedLogo?: string;
          customLogoUrl?: string;
          customLogoText?: string;
        }
      | null
      | undefined
  ) => {
    const logo = customization?.selectedLogo || "acta";
    switch (logo) {
      case "shield":
        return <Shield className="w-8 h-8 text-[#F0E7CC]" />;
      case "custom-image":
        return customization?.customLogoUrl ? (
          <Image
            src={customization.customLogoUrl}
            alt="Custom Logo"
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
        ) : (
          <Image
            src="/white.png"
            alt="ACTA"
            width={32}
            height={32}
            className="w-8 h-8"
          />
        );
      case "custom-text":
        return (
          <span className="text-lg font-bold">
            {customization?.customLogoText || "LOGO"}
          </span>
        );
      case "acta":
      default:
        return (
          <Image
            src="/white.png"
            alt="ACTA"
            width={32}
            height={32}
            className="w-8 h-8"
          />
        );
    }
  };

  const getCredentialLogoText = (
    customization:
      | {
          selectedLogo?: string;
          customLogoText?: string;
        }
      | null
      | undefined
  ) => {
    // Always show custom text if it exists and is not empty, regardless of logo type
    if (
      customization?.customLogoText &&
      customization.customLogoText.trim() !== ""
    ) {
      return customization.customLogoText;
    }

    // Fallback to default text based on logo type
    const logo = customization?.selectedLogo || "acta";
    switch (logo) {
      case "custom-text":
        return "LOGO";
      case "shield":
        return "ACTA";
      case "custom-image":
        return "ACTA";
      case "acta":
      default:
        return "ACTA";
    }
  };

  const getCredentialTemplate = (
    customization:
      | {
          selectedTemplate?: string;
        }
      | null
      | undefined
  ) => {
    const template = customization?.selectedTemplate || "classic";
    switch (template) {
      case "modern":
        return (
          <>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white transform rotate-45 translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white transform rotate-12 -translate-x-8 translate-y-8"></div>
            <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white rounded-full"></div>
            <div className="absolute top-2/3 right-1/4 w-6 h-6 bg-white rounded-full"></div>
            <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-white rounded-full"></div>
          </>
        );
      case "corporate":
        return (
          <>
            <div className="absolute top-4 right-4 w-20 h-1 bg-white"></div>
            <div className="absolute top-8 right-4 w-16 h-1 bg-white"></div>
            <div className="absolute top-12 right-4 w-12 h-1 bg-white"></div>
            <div className="absolute bottom-4 left-4 w-1 h-20 bg-white"></div>
            <div className="absolute bottom-4 left-8 w-1 h-16 bg-white"></div>
            <div className="absolute bottom-4 left-12 w-1 h-12 bg-white"></div>
          </>
        );
      case "classic":
      default:
        return (
          <>
            <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 border border-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white rounded-full"></div>
          </>
        );
    }
  };

  // Helper function to determine the correct Stellar network and create URLs
  const createStellarExpertUrl = (
    transactionHash: string,
    isSimulated = false
  ) => {
    const cleanHash = transactionHash?.trim();

    // Try both networks - for now default to testnet but we could make this configurable
    const testnetUrl = `https://stellar.expert/explorer/testnet/tx/${cleanHash}`;
    const mainnetUrl = `https://stellar.expert/explorer/public/tx/${cleanHash}`;

    if (isSimulated) {
      // Simulated transaction - will not be found on Stellar Expert
    } else {
      // Using testnet URL by default
    }

    return testnetUrl;
  };

  const handleCreateCredential = async () => {
    if (!userProfile?.has_api_key || !userProfile.api_key) {
      toast.error("API Key required to create credentials");
      return;
    }

    if (!walletAddress) {
      toast.error("Wallet connection required to create credentials");
      return;
    }

    // Validate required fields
    const missingFields = [];
    if (!credentialData.holder) missingFields.push("Holder Name");
    if (!credentialData.category) missingFields.push("Category");
    if (!credentialData.expires) missingFields.push("Expires On");

    if (missingFields.length > 0) {
      toast.error(
        `Please fill in the following required fields: ${missingFields.join(", ")}`
      );
      return;
    }

    // Validate date format
    const expirationDate = new Date(credentialData.expires);
    if (isNaN(expirationDate.getTime())) {
      toast.error("Please enter a valid expiration date");
      return;
    }

    setIsCreating(true);

    try {
      // Step 1: Authenticate with passkey before creating credential
      toast.info("Authentication required", {
        description:
          "Please authenticate with your passkey to sign the transaction",
      });

      const authResult = await authenticate();

      if (!authResult.token) {
        throw new Error("Authentication failed. Please try again.");
      }

      toast.success("Authentication successful", {
        description: "Proceeding with credential creation",
      });

      // Step 2: Create credential via API (which will deploy to Stellar in the backend)
      toast.info("Creating credential...", {
        description: "Deploying to blockchain",
      });

      const result = await apiService.createCredential({
        holder: credentialData.holder,
        category: credentialData.category,
        description: credentialData.description || "",
        expiresAt: credentialData.expires,
        issuerWallet: walletAddress, // Include wallet address
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to create credential");
      }

      const contract = result.credential;

      // Contract data received from backend

      // Step 2: Generate QR code with Stellar Expert URL
      const isSimulated = result.message.includes("simulated");
      const stellarExpertUrl = createStellarExpertUrl(
        contract.transactionHash,
        isSimulated
      );
      const qrDataUrl = await QRCode.toDataURL(stellarExpertUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setCreatedContract(contract);
      setQrCodeUrl(qrDataUrl);

      // Store credential locally associated with wallet
      if (walletAddress) {
        const existingCredentials = localStorage.getItem(
          `credentials_${walletAddress}`
        );
        const credentials = existingCredentials
          ? JSON.parse(existingCredentials)
          : [];
        const newCredential = {
          ...contract,
          qrCode: qrDataUrl,
          credentialData,
          customization: {
            selectedGradient,
            selectedLogo,
            selectedTemplate,
            customGradient,
            customLogoUrl,
            customLogoText,
          },
        };

        // Saving credential to localStorage

        credentials.unshift(newCredential); // Add to beginning of array
        localStorage.setItem(
          `credentials_${walletAddress}`,
          JSON.stringify(credentials)
        );
        setUserCredentials(credentials);
      }

      // Check if this is a real Stellar deployment (64-character hex transaction hash)
      const isRealStellarData =
        contract.transactionHash &&
        contract.transactionHash.length === 64 &&
        /^[a-f0-9]+$/i.test(contract.transactionHash) &&
        // Check if the backend actually provided the data (not generated mock)
        result.message.includes("deployed");

      const toastTitle = isRealStellarData
        ? "Credential Deployed!"
        : "Credential Created!";

      const toastDescription = isRealStellarData
        ? `Deployed to Stellar testnet
TX: ${contract.transactionHash.slice(0, 8)}...${contract.transactionHash.slice(-8)}`
        : result.message.includes("simulated")
          ? `Simulation mode - Contract deployed locally
TX: ${contract.transactionHash.slice(0, 8)}...${contract.transactionHash.slice(-8)}`
          : `ID: ${contract.id.slice(-12)}
Backend offline - mock data`;

      toast.success(toastTitle, {
        description: toastDescription,
        duration: 4000,
        action: isRealStellarData
          ? {
              label: "View on Stellar",
              onClick: () => {
                const isSimulated = result.message.includes("simulated");
                const stellarUrl = createStellarExpertUrl(
                  contract.transactionHash,
                  isSimulated
                );

                if (isSimulated) {
                  toast.warning("Simulated Transaction", {
                    description:
                      "This is a simulation - transaction won't be found on Stellar Expert",
                    duration: 4000,
                  });
                }
                window.open(stellarUrl, "_blank");
              },
            }
          : {
              label: "Copy URL",
              onClick: () => {
                navigator.clipboard.writeText(contract.verificationUrl);
                toast.success("Verification URL copied!");
              },
            },
      });

      // Reset form
      setCredentialData({
        holder: "",
        issuedBy: "ACTA",
        issuedOn: new Date().toLocaleDateString(),
        expires: "",
        category: "",
        description: "",
      });
    } catch (error) {
      let errorMessage = "Please check your connection and try again.";
      let errorTitle = "Failed to create credential";

      if (error instanceof Error) {
        if (error.message.includes("Cannot connect to API server")) {
          errorTitle = "Backend Offline";
          errorMessage = "Start backend: cd ACTA-api && cargo run";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorTitle, {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Show API Key manager if user doesn't have an API key
  if (!isLoadingUser && userProfile && !userProfile.has_api_key) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Plus className="w-5 h-5 text-[#F0E7CC]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
              Create Credential
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Design and issue new digital credentials
            </p>
          </div>
        </div>

        {/* API Key Required Notice */}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Key Required</AlertTitle>
          <AlertDescription>
            You need to generate an API key before you can create credentials.
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Key className="w-12 h-12 text-[#F0E7CC] mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Generate API Key</h3>
                <p className="text-sm text-muted-foreground">
                  Create an API key to start issuing credentials
                </p>
              </div>
              <ShimmerButton className="shadow-2xl">
                <Button
                  onClick={() => (window.location.href = "/dashboard/api-key")}
                  className="w-full"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Go to API Key Management
                </Button>
              </ShimmerButton>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (isLoadingUser) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Plus className="w-5 h-5 text-[#F0E7CC]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
              Create Credential
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Design and issue new digital credentials
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Loading user profile...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show only My Credentials section if requested
  if (showOnlyMyCredentials) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-[#F0E7CC]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
              My Credentials
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              View and manage your issued credentials
            </p>
          </div>
        </div>

        {/* Credentials Count */}
        {userCredentials.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <Badge variant="secondary" className="text-xs sm:text-sm w-fit">
              {userCredentials.length} credential
              {userCredentials.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        )}

        {/* My Credentials Section */}
        {userCredentials.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCredentials.map((credential, index) => {
                const isFlipped = false;
                return (
                  <div
                    key={`my-creds-${credential.id}-${index}`}
                    className="group"
                  >
                    <div className="relative w-full max-w-md mx-auto cursor-pointer hover:scale-105 transition-transform">
                      <div
                        className={`mini-credential-card ${isFlipped ? "flipped" : ""}`}
                        onClick={() => openDetailModal(credential)}
                      >
                        {/* Front of Card */}
                        <div className="mini-credential-front">
                          <div
                            className={`relative w-full h-56 ${credential.customization?.selectedGradient === "custom" ? "" : "bg-gradient-to-br " + getCredentialGradientClasses(credential.customization)} rounded-xl shadow-xl overflow-hidden`}
                            style={getCredentialGradientStyle(
                              credential.customization
                            )}
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
                                  {getCredentialLogoComponent(
                                    credential.customization
                                  )}
                                  <span className="text-sm font-medium">
                                    {getCredentialLogoText(
                                      credential.customization
                                    )}
                                  </span>
                                </div>
                                <CreditCard className="w-6 h-6 text-[#F0E7CC]" />
                              </div>

                              {/* Middle Content */}
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs text-[#F0E7CC]/70 uppercase tracking-wide">
                                    Holder
                                  </p>
                                  <p className="text-lg font-semibold truncate">
                                    {credential.holder || "Unknown Holder"}
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs text-[#F0E7CC]/70 uppercase tracking-wide">
                                      Category
                                    </p>
                                    <p className="text-sm font-medium truncate">
                                      {credential.category || "General"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-[#F0E7CC]/70 uppercase tracking-wide">
                                      Expires
                                    </p>
                                    <p className="text-sm font-medium">
                                      {credential.expiresAt
                                        ? new Date(
                                            credential.expiresAt
                                          ).toLocaleDateString()
                                        : "N/A"}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Footer */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-[#F0E7CC]/70 uppercase tracking-wide">
                                    Issued By
                                  </p>
                                  <p className="text-sm font-medium">
                                    {credentialData.issuedBy}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end">
                                  <div className="flex items-center space-x-1">
                                    <CheckCircle className="w-4 h-4 text-[#F0E7CC]" />
                                    <span className="text-xs">Verified</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Back of Card */}
                        <div className="mini-credential-back">
                          <div className="relative w-full h-56 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-xl overflow-hidden">
                            {/* Magnetic Stripe */}
                            <div className="w-full h-12 bg-black mt-6"></div>

                            <div className="p-6 text-white space-y-4">
                              <div>
                                <p className="text-xs text-gray-300 uppercase tracking-wide">
                                  Issued On
                                </p>
                                <p className="text-sm font-medium">
                                  {credential.issuedAt
                                    ? new Date(
                                        credential.issuedAt
                                      ).toLocaleDateString()
                                    : new Date().toLocaleDateString()}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-300 uppercase tracking-wide">
                                  Description
                                </p>
                                <p className="text-xs text-gray-200 leading-relaxed">
                                  {credential.description ||
                                    "Digital credential issued by ACTA platform for secure verification and authentication."}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Sparkles className="w-4 h-4 text-[#F0E7CC]" />
                                  <span className="text-xs">
                                    Stellar Verified
                                  </span>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-300">
                                    ID: {credential.id.slice(-8)}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Contract:{" "}
                                    {credential.contractAddress.slice(0, 4)}...
                                    {credential.contractAddress.slice(-4)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 mx-auto text-[#F0E7CC] mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Credentials Yet
            </h3>
            <p className="text-muted-foreground mb-6">
              You haven&apos;t created any credentials yet. Start by creating
              your first credential.
            </p>
            <ShimmerButton className="shadow-2xl">
              <Button
                onClick={() =>
                  (window.location.href = "/dashboard/credentials")
                }
                className="bg-black text-white hover:bg-gray-800 rounded-2xl h-10 px-4 font-semibold shadow-lg transition-all border-2 border-[#F0E7CC]/40 hover:border-[#F0E7CC]/60 golden-border-animated"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Credential
              </Button>
            </ShimmerButton>
          </div>
        )}

        {/* QR Code Modal */}
        {showQrModal && qrCodeUrl && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQrModal(false)}
          >
            <div
              className="bg-white rounded-lg p-6 max-w-sm w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Scan QR Code for Stellar Explorer
                </h3>
                <div className="flex justify-center mb-4">
                  <Image
                    src={qrCodeUrl}
                    alt="QR Code"
                    width={256}
                    height={256}
                    className="w-64 h-64 border rounded-lg"
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan this QR code to view the transaction on Stellar Expert
                </p>
                <Button
                  onClick={() => setShowQrModal(false)}
                  className="w-full bg-black text-white hover:bg-gray-800 rounded-2xl h-10 px-4 font-semibold shadow-lg transition-all border-2 border-[#F0E7CC]/40 hover:border-[#F0E7CC]/60 golden-border-animated"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Credential Detail Modal */}
        {showDetailModal && selectedCredential && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <div
              className="bg-background/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                {/* Left Column - Large Credential Card */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">
                      Credential Details
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailCardFlipped(!detailCardFlipped)}
                      className="flex items-center space-x-2"
                    >
                      {detailCardFlipped ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      <span>{detailCardFlipped ? "Front" : "Back"}</span>
                    </Button>
                  </div>

                  {/* Large Credit Card */}
                  <div className="relative w-full max-w-md mx-auto">
                    <div
                      className={`credential-card ${detailCardFlipped ? "flipped" : ""}`}
                    >
                      {/* Front of Card */}
                      <div className="credential-front">
                        <div
                          className={`relative w-full h-56 ${selectedCredential.customization?.selectedGradient === "custom" ? "" : "bg-gradient-to-br " + getCredentialGradientClasses(selectedCredential.customization)} rounded-xl shadow-xl overflow-hidden`}
                          style={getCredentialGradientStyle(
                            selectedCredential.customization
                          )}
                        >
                          {/* Background Pattern */}
                          <div className="absolute inset-0 opacity-10">
                            {getCredentialTemplate(
                              selectedCredential.customization
                            )}
                          </div>

                          {/* Card Content */}
                          <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {getCredentialLogoComponent(
                                  selectedCredential.customization
                                )}
                                <span className="text-sm font-medium">
                                  {getCredentialLogoText(
                                    selectedCredential.customization
                                  )}
                                </span>
                              </div>
                              <CreditCard className="w-6 h-6 text-[#F0E7CC]" />
                            </div>

                            {/* Middle Content */}
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs text-[#F0E7CC]/70 uppercase tracking-wide">
                                  Holder
                                </p>
                                <p className="text-lg font-semibold truncate">
                                  {selectedCredential.holder ||
                                    "Unknown Holder"}
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-[#F0E7CC]/70 uppercase tracking-wide">
                                    Category
                                  </p>
                                  <p className="text-sm font-medium truncate">
                                    {selectedCredential.category || "General"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-[#F0E7CC]/70 uppercase tracking-wide">
                                    Expires
                                  </p>
                                  <p className="text-sm font-medium">
                                    {selectedCredential.expiresAt
                                      ? new Date(
                                          selectedCredential.expiresAt
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-[#F0E7CC]/70 uppercase tracking-wide">
                                  Issued By
                                </p>
                                <p className="text-sm font-medium">
                                  {selectedCredential.issuer || "ACTA"}
                                </p>
                              </div>
                              <div className="flex flex-col items-end">
                                <div className="flex items-center space-x-1">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-xs">Verified</span>
                                </div>
                                <div className="flex items-center space-x-1 mt-1"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Back of Card */}
                      <div className="credential-back">
                        <div className="relative w-full h-56 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-xl overflow-hidden">
                          {/* Magnetic Stripe */}
                          <div className="w-full h-12 bg-black mt-6"></div>

                          <div className="p-6 text-white space-y-4">
                            <div>
                              <p className="text-xs text-gray-300 uppercase tracking-wide">
                                Issued On
                              </p>
                              <p className="text-sm font-medium">
                                {selectedCredential.issuedAt
                                  ? new Date(
                                      selectedCredential.issuedAt
                                    ).toLocaleDateString()
                                  : new Date().toLocaleDateString()}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-300 uppercase tracking-wide">
                                Description
                              </p>
                              <p className="text-xs text-gray-200 leading-relaxed">
                                {selectedCredential.description ||
                                  "Digital credential issued by ACTA platform for secure verification and authentication."}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                              <div className="flex items-center space-x-2">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-xs">
                                  Stellar Verified
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-300">
                                  ID: {selectedCredential.id.slice(-8)}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Contract:{" "}
                                  {selectedCredential.contractAddress.slice(
                                    0,
                                    4
                                  )}
                                  ...
                                  {selectedCredential.contractAddress.slice(-4)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code Section */}
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Verification QR Code
                    </h3>
                    <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg border border-white/20">
                      <div className="bg-white rounded p-3">
                        <Image
                          src={selectedCredential.qrCode || ""}
                          alt="Verification QR Code"
                          width={192}
                          height={192}
                          className="w-48 h-48 mx-auto"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      Scan this QR code to view the transaction on Stellar
                      Expert
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const stellarExpertUrl = `https://stellar.expert/explorer/testnet/tx/${selectedCredential.transactionHash}`;
                        navigator.clipboard.writeText(stellarExpertUrl);
                        toast.success("Stellar Expert URL copied!");
                      }}
                      className="mt-2"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Stellar Expert URL
                    </Button>
                  </div>
                </div>

                {/* Right Column - Stellar Information */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">
                      Blockchain Information
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDetailModal(false)}
                      className="bg-black text-white hover:bg-gray-800 rounded-2xl h-8 px-3 font-semibold shadow-lg transition-all border-2 border-[#F0E7CC]/40 hover:border-[#F0E7CC]/60 golden-border-animated"
                    >
                      Close
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {/* Credential ID */}
                    <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Credential ID
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              selectedCredential.id
                            );
                            toast.success("Credential ID copied!");
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-foreground font-mono bg-white/5 backdrop-blur-sm p-2 rounded">
                        {selectedCredential.id}
                      </p>
                    </Card>

                    {/* Contract Address */}
                    <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Contract Address
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              selectedCredential.contractAddress
                            );
                            toast.success("Contract address copied!");
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-foreground font-mono bg-white/5 backdrop-blur-sm p-2 rounded break-all">
                        {selectedCredential.contractAddress}
                      </p>
                    </Card>

                    {/* Transaction Hash */}
                    <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Transaction Hash
                        </label>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                selectedCredential.transactionHash
                              );
                              toast.success("Transaction hash copied!");
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const stellarUrl = `https://stellar.expert/explorer/testnet/tx/${selectedCredential.transactionHash}`;
                              // Check if this might be a mock hash
                              const isMockData =
                                !selectedCredential.transactionHash ||
                                selectedCredential.transactionHash ===
                                  "unknown";

                              if (isMockData) {
                                toast.warning("Demo Mode", {
                                  description:
                                    "Backend offline - mock data shown",
                                  duration: 3000,
                                });
                              }
                              window.open(stellarUrl, "_blank");
                            }}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-foreground font-mono bg-white/5 backdrop-blur-sm p-2 rounded break-all">
                        {selectedCredential.transactionHash}
                      </p>
                      {selectedCredential.transactionHash === "unknown" && (
                        <p className="text-xs text-orange-400 mt-2 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Demo data - Backend offline
                        </p>
                      )}
                    </Card>

                    {/* Credential Hash */}
                    <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          Credential Hash
                        </label>
                        {selectedCredential.hash && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                selectedCredential.hash!
                              );
                              toast.success("Credential hash copied!");
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-foreground font-mono bg-white/5 backdrop-blur-sm p-2 rounded break-all">
                        {selectedCredential.hash ||
                          "Hash not available for this credential"}
                      </p>
                      {!selectedCredential.hash && (
                        <p className="text-xs text-orange-400 mt-2 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Create a new credential to see the hash
                        </p>
                      )}
                    </Card>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const cleanHash =
                            selectedCredential.transactionHash?.trim();
                          const stellarUrl = `https://stellar.expert/explorer/testnet/tx/${cleanHash}`;
                          window.open(stellarUrl, "_blank");
                        }}
                        className="w-full"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        View on Stellar Explorer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .credential-card {
            perspective: 1000px;
            width: 100%;
            height: 224px;
          }

          .credential-front,
          .credential-back {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            transition: transform 0.6s;
          }

          .credential-back {
            transform: rotateY(180deg);
          }

          .credential-card.flipped .credential-front {
            transform: rotateY(180deg);
          }

          .credential-card.flipped .credential-back {
            transform: rotateY(0deg);
          }

          /* Mini credential card styles */
          .mini-credential-card {
            perspective: 1000px;
            width: 100%;
            height: 224px;
          }

          .mini-credential-front,
          .mini-credential-back {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            transition: transform 0.6s;
          }

          .mini-credential-back {
            transform: rotateY(180deg);
          }

          .mini-credential-card.flipped .mini-credential-front {
            transform: rotateY(180deg);
          }

          .mini-credential-card.flipped .mini-credential-back {
            transform: rotateY(0deg);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Create Credential
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Design and issue new digital credentials
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Left Column - Credential Preview */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Credential Preview
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex items-center space-x-2"
            >
              {isFlipped ? (
                <EyeOff className="w-4 h-4 text-[#F0E7CC]" />
              ) : (
                <Eye className="w-4 h-4 text-[#F0E7CC]" />
              )}
              <span>{isFlipped ? "Front" : "Back"}</span>
            </Button>
          </div>

          {/* Credit Card Style Credential */}
          <div className="relative w-full max-w-md">
            <div className={`credential-card ${isFlipped ? "flipped" : ""}`}>
              {/* Front of Card */}
              <div className="credential-front">
                <div
                  className={`relative w-full h-56 ${selectedGradient === "custom" ? "" : "bg-gradient-to-br " + getGradientClasses(selectedGradient)} rounded-xl shadow-xl overflow-hidden`}
                  style={getGradientStyle(selectedGradient)}
                >
                  {/* Background Pattern - Changes based on template */}
                  <div className="absolute inset-0 opacity-10">
                    {selectedTemplate === "classic" && (
                      <>
                        <div className="absolute top-4 right-4 w-16 h-16 border-2 border-white rounded-full"></div>
                        <div className="absolute bottom-4 left-4 w-12 h-12 border border-white rounded-full"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white rounded-full"></div>
                      </>
                    )}
                    {selectedTemplate === "modern" && (
                      <>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white transform rotate-45 translate-x-16 -translate-y-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white transform rotate-12 -translate-x-8 translate-y-8"></div>
                        <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white rounded-full"></div>
                        <div className="absolute top-2/3 right-1/4 w-6 h-6 bg-white rounded-full"></div>
                        <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-white rounded-full"></div>
                      </>
                    )}
                    {selectedTemplate === "corporate" && (
                      <>
                        <div className="absolute top-4 right-4 w-20 h-1 bg-white"></div>
                        <div className="absolute top-8 right-4 w-16 h-1 bg-white"></div>
                        <div className="absolute top-12 right-4 w-12 h-1 bg-white"></div>
                        <div className="absolute bottom-4 left-4 w-1 h-20 bg-white"></div>
                        <div className="absolute bottom-4 left-8 w-1 h-16 bg-white"></div>
                        <div className="absolute bottom-4 left-12 w-1 h-12 bg-white"></div>
                      </>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getLogoComponent(selectedLogo)}
                        <span className="text-sm font-medium">
                          {getLogoText(selectedLogo)}
                        </span>
                      </div>
                      <CreditCard className="w-6 h-6 text-[#F0E7CC]" />
                    </div>

                    {/* Middle Content */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-[#F0E7CC]/70 uppercase tracking-wide">
                          Holder
                        </p>
                        <p className="text-lg font-semibold truncate">
                          {credentialData.holder || "John Doe"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-[#F0E7CC]/70 uppercase tracking-wide">
                            Category
                          </p>
                          <p className="text-sm font-medium truncate">
                            {credentialData.category || "Identity"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#F0E7CC]/70 uppercase tracking-wide">
                            Expires
                          </p>
                          <p className="text-sm font-medium">
                            {credentialData.expires
                              ? new Date(
                                  credentialData.expires
                                ).toLocaleDateString()
                              : "12/25"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[#F0E7CC]/70 uppercase tracking-wide">
                          Issued By
                        </p>
                        <p className="text-sm font-medium">
                          {credentialData.issuedBy}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs">Verified</span>
                        </div>
                        {createdContract && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Shield className="w-3 h-3 text-[#F0E7CC]" />
                            <span className="text-xs">Blockchain</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back of Card */}
              <div className="credential-back">
                <div className="relative w-full h-56 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-xl overflow-hidden">
                  {/* Magnetic Stripe */}
                  <div className="w-full h-12 bg-black mt-6"></div>

                  <div className="p-6 text-white space-y-4">
                    <div>
                      <p className="text-xs text-gray-300 uppercase tracking-wide">
                        Issued On
                      </p>
                      <p className="text-sm font-medium">
                        {credentialData.issuedOn}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-300 uppercase tracking-wide">
                        Description
                      </p>
                      <p className="text-xs text-gray-200 leading-relaxed">
                        {credentialData.description ||
                          "Digital credential issued by ACTA platform for secure verification and authentication."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs">
                          {createdContract
                            ? "Stellar Verified"
                            : "Blockchain Verified"}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-300">
                          {createdContract
                            ? `ID: ${createdContract.id.slice(-8)}`
                            : "ID: **** **** ****"}
                        </p>
                        {createdContract && (
                          <p className="text-xs text-gray-400 mt-1">
                            Contract:{" "}
                            {createdContract.contractAddress.slice(0, 4)}...
                            {createdContract.contractAddress.slice(-4)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customization Options */}
          <Card className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-[#F0E7CC]" />
              Customize Credential
            </h3>

            <div className="space-y-6">
              {/* Color Selection */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Background Color
                </h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setSelectedGradient("blue-purple")}
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 border-2 ${selectedGradient === "blue-purple" ? "border-blue-500" : "border-gray-300"} shadow-md hover:scale-105 transition-transform`}
                    title="Blue Purple"
                  ></button>
                  <button
                    onClick={() => setSelectedGradient("emerald-teal")}
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-800 border-2 ${selectedGradient === "emerald-teal" ? "border-teal-500" : "border-gray-300"} shadow-md hover:scale-105 transition-transform`}
                    title="Emerald Green"
                  ></button>
                  <button
                    onClick={() => setSelectedGradient("rose-red")}
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br from-rose-600 via-pink-600 to-red-800 border-2 ${selectedGradient === "rose-red" ? "border-rose-500" : "border-gray-300"} shadow-md hover:scale-105 transition-transform`}
                    title="Rose Red"
                  ></button>
                  <button
                    onClick={() => setSelectedGradient("amber-orange")}
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br from-amber-600 via-orange-600 to-red-800 border-2 ${selectedGradient === "amber-orange" ? "border-amber-500" : "border-gray-300"} shadow-md hover:scale-105 transition-transform`}
                    title="Amber Orange"
                  ></button>
                  <button
                    onClick={() => setSelectedGradient("gray-slate")}
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br from-gray-600 via-slate-600 to-gray-800 border-2 ${selectedGradient === "gray-slate" ? "border-gray-500" : "border-gray-300"} shadow-md hover:scale-105 transition-transform`}
                    title="Elegant Gray"
                  ></button>

                  {/* Custom Color Picker Button */}
                  <button
                    onClick={() => {
                      setSelectedGradient("custom");
                      setShowColorPicker(!showColorPicker);
                    }}
                    className={`w-12 h-12 rounded-lg border-2 ${selectedGradient === "custom" ? "border-purple-500" : "border-white/20"} shadow-md hover:scale-105 transition-transform flex items-center justify-center bg-white/10 backdrop-blur-sm`}
                    style={
                      selectedGradient === "custom"
                        ? {
                            background: `linear-gradient(135deg, ${customGradient.start} 0%, ${customGradient.end} 100%)`,
                          }
                        : {}
                    }
                    title="Custom Palette"
                  >
                    <svg
                      className="w-6 h-6 text-[#F0E7CC]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                      />
                    </svg>
                  </button>
                </div>

                {/* Color Picker Panel */}
                {showColorPicker && (
                  <div className="mt-4 p-4 border border-white/20 rounded-lg bg-white/5 backdrop-blur-sm">
                    <h5 className="text-sm font-medium text-muted-foreground mb-3">
                      Custom Colors
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-2">
                          Start Color
                        </label>
                        <input
                          type="color"
                          value={customGradient.start}
                          onChange={e =>
                            setCustomGradient(prev => ({
                              ...prev,
                              start: e.target.value,
                            }))
                          }
                          className="w-full h-10 border border-white/20 rounded cursor-pointer bg-white/10 backdrop-blur-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-2">
                          End Color
                        </label>
                        <input
                          type="color"
                          value={customGradient.end}
                          onChange={e =>
                            setCustomGradient(prev => ({
                              ...prev,
                              end: e.target.value,
                            }))
                          }
                          className="w-full h-10 border border-white/20 rounded cursor-pointer bg-white/10 backdrop-blur-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Logo Selection */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Logo Style
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedLogo("acta")}
                      className={`p-3 ${selectedLogo === "acta" ? "bg-[#F0E7CC]/20 border-[#F0E7CC]/40" : "bg-white/5 backdrop-blur-sm border-white/20"} border-2 rounded-lg hover:bg-[#F0E7CC]/30 transition-colors flex items-center justify-center`}
                    >
                      <Image
                        src="/white.png"
                        alt="ACTA"
                        width={24}
                        height={24}
                        className="w-6 h-6 mr-2"
                      />
                      <span className="text-sm font-medium">ACTA</span>
                    </button>
                    <button
                      onClick={() => setSelectedLogo("shield")}
                      className={`p-3 ${selectedLogo === "shield" ? "bg-[#F0E7CC]/20 border-[#F0E7CC]/40" : "bg-white/5 backdrop-blur-sm border-white/20"} border-2 rounded-lg hover:bg-[#F0E7CC]/30 transition-colors flex items-center justify-center`}
                    >
                      <Shield className="w-6 h-6 mr-2 text-[#F0E7CC]" />
                      <span className="text-sm font-medium">Shield</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedLogo("custom-text")}
                      className={`p-3 ${selectedLogo === "custom-text" ? "bg-[#F0E7CC]/20 border-[#F0E7CC]/40" : "bg-white/5 backdrop-blur-sm border-white/20"} border-2 rounded-lg hover:bg-[#F0E7CC]/30 transition-colors flex items-center justify-center`}
                    >
                      <span className="text-lg font-bold mr-2">ABC</span>
                      <span className="text-sm font-medium">Text</span>
                    </button>
                    <button
                      onClick={() => setSelectedLogo("custom-image")}
                      className={`p-3 ${selectedLogo === "custom-image" ? "bg-[#F0E7CC]/20 border-[#F0E7CC]/40" : "bg-white/5 backdrop-blur-sm border-white/20"} border-2 rounded-lg hover:bg-[#F0E7CC]/30 transition-colors flex items-center justify-center`}
                    >
                      <svg
                        className="w-6 h-6 mr-2 text-[#F0E7CC]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm font-medium">Image</span>
                    </button>
                  </div>

                  {/* Custom Text Input */}
                  {selectedLogo === "custom-text" && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={customLogoText}
                        onChange={e => {
                          setCustomLogoText(e.target.value);
                        }}
                        placeholder="Enter your text..."
                        className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 backdrop-blur-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50"
                        autoFocus
                      />
                      <p className="text-xs text-muted-foreground">
                        The text will appear as the logo on your credential
                      </p>
                    </div>
                  )}

                  {/* Custom Image Upload */}
                  {selectedLogo === "custom-image" && (
                    <div className="space-y-2">
                      <div className="border-2 border-dashed border-white/30 rounded-lg p-4 text-center hover:border-blue-400/60 transition-colors bg-white/5 backdrop-blur-sm">
                        {customLogoUrl ? (
                          <div className="space-y-2">
                            <Image
                              src={customLogoUrl}
                              alt="Logo preview"
                              width={64}
                              height={64}
                              className="w-16 h-16 object-contain mx-auto"
                            />
                            <p className="text-sm text-green-400">
                              Logo uploaded successfully
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <svg
                              className="mx-auto h-8 w-8 text-muted-foreground"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <p className="text-sm text-muted-foreground">
                              Upload your logo
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="cursor-pointer inline-block mt-2 px-3 py-1 bg-[#F0E7CC]/20 text-[#F0E7CC] text-sm rounded hover:bg-[#F0E7CC]/30 transition-colors backdrop-blur-sm border border-[#F0E7CC]/30"
                        >
                          {customLogoUrl ? "Change image" : "Select file"}
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, SVG up to 2MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Template Selection */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Template
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setSelectedTemplate("classic")}
                    className={`p-3 ${selectedTemplate === "classic" ? "bg-[#F0E7CC]/20 border-[#F0E7CC]/40" : "bg-white/5 backdrop-blur-sm border-white/20"} border-2 rounded-lg hover:bg-[#F0E7CC]/30 transition-colors text-center`}
                  >
                    <CreditCard className="w-6 h-6 mx-auto mb-1 text-[#F0E7CC]" />
                    <span className="text-xs font-medium">Classic</span>
                  </button>
                  <button
                    onClick={() => setSelectedTemplate("modern")}
                    className={`p-3 ${selectedTemplate === "modern" ? "bg-[#F0E7CC]/20 border-[#F0E7CC]/40" : "bg-white/5 backdrop-blur-sm border-white/20"} border-2 rounded-lg hover:bg-[#F0E7CC]/30 transition-colors text-center`}
                  >
                    <Sparkles
                      className="w-6 h-6 mx-auto mb-1 text-[#F0E7CC]
                    "
                    />
                    <span className="text-xs font-medium">Modern</span>
                  </button>
                  <button
                    onClick={() => setSelectedTemplate("corporate")}
                    className={`p-3 ${selectedTemplate === "corporate" ? "bg-[#F0E7CC]/20 border-[#F0E7CC]/40" : "bg-white/5 backdrop-blur-sm border-white/20"} border-2 rounded-lg hover:bg-[#F0E7CC]/30 transition-colors text-center`}
                  >
                    <Building className="w-6 h-6 mx-auto mb-1 text-[#F0E7CC]" />
                    <span className="text-xs font-medium">Corporativa</span>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Form */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">
            Credential Details
          </h2>

          <Card className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 space-y-6">
            {/* Credential Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground flex items-center">
                <User className="w-5 h-5 mr-2 text-[#F0E7CC]" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Holder Name *
                  </label>
                  <input
                    type="text"
                    value={credentialData.holder}
                    onChange={e => handleInputChange("holder", e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F0E7CC] focus:border-[#F0E7CC] text-foreground placeholder-muted-foreground"
                    placeholder="Enter holder name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Issued By
                  </label>
                  <input
                    type="text"
                    value={credentialData.issuedBy}
                    onChange={e =>
                      handleInputChange("issuedBy", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F0E7CC] focus:border-[#F0E7CC] text-foreground placeholder-muted-foreground"
                    placeholder="Organization name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Category *
                  </label>
                  <select
                    value={credentialData.category}
                    onChange={e =>
                      handleInputChange("category", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F0E7CC] focus:border-[#F0E7CC] text-foreground appearance-none cursor-pointer [&>option]:bg-gray-800 [&>option]:text-white [&>option:checked]:bg-blue-600"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a1a1aa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: "right 0.5rem center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "1.5em 1.5em",
                      paddingRight: "2.5rem",
                    }}
                    required
                  >
                    <option value="" className="text-gray-400 bg-gray-800">
                      Select category
                    </option>
                    <option value="Identity" className="text-white bg-gray-800">
                      Identity
                    </option>
                    <option
                      value="Education"
                      className="text-white bg-gray-800"
                    >
                      Education
                    </option>
                    <option
                      value="Certification"
                      className="text-white bg-gray-800"
                    >
                      Certification
                    </option>
                    <option value="License" className="text-white bg-gray-800">
                      License
                    </option>
                    <option
                      value="Membership"
                      className="text-white bg-gray-800"
                    >
                      Membership
                    </option>
                    <option
                      value="Achievement"
                      className="text-white bg-gray-800"
                    >
                      Achievement
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Expires On *
                  </label>
                  <input
                    type="date"
                    value={credentialData.expires}
                    onChange={e => handleInputChange("expires", e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F0E7CC] focus:border-[#F0E7CC] text-foreground"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={credentialData.description}
                  onChange={e =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F0E7CC] focus:border-[#F0E7CC] text-foreground placeholder-muted-foreground"
                  placeholder="Brief description of the credential"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <ShimmerButton className="shadow-2xl">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCredentialData({
                      holder: "",
                      issuedBy: "ACTA",
                      issuedOn: new Date().toLocaleDateString(),
                      expires: "",
                      category: "",
                      description: "",
                    });
                  }}
                  className="bg-black text-white hover:bg-gray-800 rounded-2xl h-10 px-4 font-semibold shadow-lg transition-all border-2 border-[#F0E7CC]/40 hover:border-[#F0E7CC]/60 golden-border-animated"
                >
                  Reset
                </Button>
              </ShimmerButton>

              <ShimmerButton className="shadow-2xl">
                <Button
                  onClick={handleCreateCredential}
                  disabled={
                    isCreating || isAuthenticating || !userProfile?.has_api_key
                  }
                  className="bg-black text-white hover:bg-gray-800 rounded-2xl h-10 px-4 font-semibold shadow-lg transition-all border-2 border-[#F0E7CC]/40 hover:border-[#F0E7CC]/60 golden-border-animated"
                >
                  {isAuthenticating ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Authenticating...
                    </>
                  ) : isCreating ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Create Credential
                    </>
                  )}
                </Button>
              </ShimmerButton>
            </div>
          </Card>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && qrCodeUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-sm w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Scan QR Code for Stellar Explorer
              </h3>
              <div className="flex justify-center mb-4">
                <Image
                  src={qrCodeUrl}
                  alt="QR Code"
                  width={256}
                  height={256}
                  className="w-64 h-64 border rounded-lg"
                />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Scan this QR code to view the transaction on Stellar Expert
              </p>
              <Button
                onClick={() => setShowQrModal(false)}
                className="w-full bg-black text-white hover:bg-gray-800 rounded-2xl h-10 px-4 font-semibold shadow-lg transition-all border-2 border-[#F0E7CC]/40 hover:border-[#F0E7CC]/60 golden-border-animated"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Credential Detail Modal */}
      {showDetailModal && selectedCredential && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-background/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Left Column - Large Credential Card */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">
                    Credential Details
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDetailCardFlipped(!detailCardFlipped)}
                    className="flex items-center space-x-2"
                  >
                    {detailCardFlipped ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                    <span>{detailCardFlipped ? "Front" : "Back"}</span>
                  </Button>
                </div>

                {/* Large Credit Card */}
                <div className="relative w-full max-w-md mx-auto">
                  <div
                    className={`credential-card ${detailCardFlipped ? "flipped" : ""}`}
                  >
                    {/* Front of Card */}
                    <div className="credential-front">
                      <div
                        className={`relative w-full h-56 ${selectedCredential.customization?.selectedGradient === "custom" ? "" : "bg-gradient-to-br " + getCredentialGradientClasses(selectedCredential.customization)} rounded-xl shadow-xl overflow-hidden`}
                        style={getCredentialGradientStyle(
                          selectedCredential.customization
                        )}
                      >
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                          {getCredentialTemplate(
                            selectedCredential.customization
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getCredentialLogoComponent(
                                selectedCredential.customization
                              )}
                              <span className="text-sm font-medium">
                                {getCredentialLogoText(
                                  selectedCredential.customization
                                )}
                              </span>
                            </div>
                            <CreditCard className="w-6 h-6 text-[#F0E7CC]" />
                          </div>

                          {/* Middle Content */}
                          <div className="space-y-3">
                            <div>
                              <p className="text-xs text-[#F0E7CC]/70 uppercase tracking-wide">
                                Holder
                              </p>
                              <p className="text-lg font-semibold truncate">
                                {selectedCredential.holder || "Unknown Holder"}
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-[#F0E7CC]/70 uppercase tracking-wide">
                                  Category
                                </p>
                                <p className="text-sm font-medium truncate">
                                  {selectedCredential.category || "General"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-[#F0E7CC]/70 uppercase tracking-wide">
                                  Expires
                                </p>
                                <p className="text-sm font-medium">
                                  {selectedCredential.expiresAt
                                    ? new Date(
                                        selectedCredential.expiresAt
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-[#F0E7CC]/70 uppercase tracking-wide">
                                Issued By
                              </p>
                              <p className="text-sm font-medium">
                                {selectedCredential.issuer || "ACTA"}
                              </p>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs">Verified</span>
                              </div>
                              <div className="flex items-center space-x-1 mt-1"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Back of Card */}
                    <div className="credential-back">
                      <div className="relative w-full h-56 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-xl overflow-hidden">
                        {/* Magnetic Stripe */}
                        <div className="w-full h-12 bg-black mt-6"></div>

                        <div className="p-6 text-white space-y-4">
                          <div>
                            <p className="text-xs text-gray-300 uppercase tracking-wide">
                              Issued On
                            </p>
                            <p className="text-sm font-medium">
                              {selectedCredential.issuedAt
                                ? new Date(
                                    selectedCredential.issuedAt
                                  ).toLocaleDateString()
                                : new Date().toLocaleDateString()}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-300 uppercase tracking-wide">
                              Description
                            </p>
                            <p className="text-xs text-gray-200 leading-relaxed">
                              {selectedCredential.description ||
                                "Digital credential issued by ACTA platform for secure verification and authentication."}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                            <div className="flex items-center space-x-2">
                              <Sparkles className="w-4 h-4" />
                              <span className="text-xs">Stellar Verified</span>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-300">
                                ID: {selectedCredential.id.slice(-8)}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Contract:{" "}
                                {selectedCredential.contractAddress.slice(0, 4)}
                                ...
                                {selectedCredential.contractAddress.slice(-4)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR Code Section */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Verification QR Code
                  </h3>
                  <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-lg shadow-lg border border-white/20">
                    <div className="bg-white rounded p-3">
                      <Image
                        src={selectedCredential.qrCode || ""}
                        alt="Verification QR Code"
                        width={192}
                        height={192}
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Scan this QR code to view the transaction on Stellar Expert
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const stellarExpertUrl = `https://stellar.expert/explorer/testnet/tx/${selectedCredential.transactionHash}`;
                      navigator.clipboard.writeText(stellarExpertUrl);
                      toast.success("Stellar Expert URL copied!");
                    }}
                    className="mt-2"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Stellar Expert URL
                  </Button>
                </div>
              </div>

              {/* Right Column - Stellar Information */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">
                    Blockchain Information
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetailModal(false)}
                    className="bg-black text-white hover:bg-gray-800 rounded-2xl h-8 px-3 font-semibold shadow-lg transition-all border-2 border-[#F0E7CC]/40 hover:border-[#F0E7CC]/60 golden-border-animated"
                  >
                    Close
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Credential ID */}
                  <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Credential ID
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedCredential.id);
                          toast.success("Credential ID copied!");
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-foreground font-mono bg-white/5 backdrop-blur-sm p-2 rounded">
                      {selectedCredential.id}
                    </p>
                  </Card>

                  {/* Contract Address */}
                  <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Contract Address
                      </label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            selectedCredential.contractAddress
                          );
                          toast.success("Contract address copied!");
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-foreground font-mono bg-white/5 backdrop-blur-sm p-2 rounded">
                      {selectedCredential.contractAddress}
                    </p>
                  </Card>

                  {/* Transaction Hash */}
                  <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Transaction Hash
                      </label>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              selectedCredential.transactionHash
                            );
                            toast.success("Transaction hash copied!");
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Clean the transaction hash of any potential whitespace or special characters
                            const cleanHash =
                              selectedCredential.transactionHash?.trim();
                            const stellarUrl = `https://stellar.expert/explorer/testnet/tx/${cleanHash}`;

                            // Check if this might be a mock hash
                            const isMockData =
                              !selectedCredential.transactionHash ||
                              selectedCredential.transactionHash === "unknown";

                            if (isMockData) {
                              toast.warning("Demo Mode", {
                                description:
                                  "Backend offline - mock data shown",
                                duration: 3000,
                              });
                            }
                            window.open(stellarUrl, "_blank");
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-foreground font-mono bg-white/5 backdrop-blur-sm p-2 rounded break-all">
                      {selectedCredential.transactionHash}
                    </p>
                    {selectedCredential.transactionHash === "unknown" && (
                      <p className="text-xs text-orange-400 mt-2 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Demo data - Backend offline
                      </p>
                    )}
                  </Card>

                  {/* Credential Hash */}
                  <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Credential Hash
                      </label>
                      {selectedCredential.hash && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              selectedCredential.hash!
                            );
                            toast.success("Credential hash copied!");
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-foreground font-mono bg-white/5 backdrop-blur-sm p-2 rounded break-all">
                      {selectedCredential.hash ||
                        "Hash not available for this credential"}
                    </p>
                    {!selectedCredential.hash && (
                      <p className="text-xs text-orange-400 mt-2 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Create a new credential to see the hash
                      </p>
                    )}
                  </Card>

                  {/* Status */}
                  <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Credential Status
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium capitalize text-green-400">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      This credential is active and ready for verification
                    </p>
                  </Card>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const cleanHash =
                          selectedCredential.transactionHash?.trim();
                        const stellarUrl = `https://stellar.expert/explorer/testnet/tx/${cleanHash}`;
                        window.open(stellarUrl, "_blank");
                      }}
                      className="w-full"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      View on Stellar Explorer
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .credential-card {
          perspective: 1000px;
          width: 100%;
          height: 224px;
        }

        .credential-front,
        .credential-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          transition: transform 0.6s;
        }

        .credential-back {
          transform: rotateY(180deg);
        }

        .credential-card.flipped .credential-front {
          transform: rotateY(180deg);
        }

        .credential-card.flipped .credential-back {
          transform: rotateY(0deg);
        }

        /* Mini credential card styles */
        .mini-credential-card {
          perspective: 1000px;
          width: 100%;
          height: 224px;
        }

        .mini-credential-front,
        .mini-credential-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          transition: transform 0.6s;
        }

        .mini-credential-back {
          transform: rotateY(180deg);
        }

        .mini-credential-card.flipped .mini-credential-front {
          transform: rotateY(180deg);
        }

        .mini-credential-card.flipped .mini-credential-back {
          transform: rotateY(0deg);
        }
      `}</style>
    </div>
  );
}
