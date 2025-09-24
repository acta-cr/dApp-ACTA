"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Fingerprint, Plus, KeyRound, Loader2 } from "lucide-react";
import { ShineBorder } from "@/components/magicui/shine-border";
import { useSimplePasskey } from "@/hooks/use-simple-passkey";
import { toast } from "sonner";

interface SimplePasskeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (walletAddress: string, token: string) => void;
}

export const SimplePasskeyModal: React.FC<SimplePasskeyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { createWallet, authenticate, isLoading, error } = useSimplePasskey();
  const [modalError, setModalError] = useState<string>("");
  const [webAuthnSupported, setWebAuthnSupported] = useState<boolean>(true);

  // Check WebAuthn support on component mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const supported = !!(
        navigator.credentials &&
        typeof navigator.credentials.create === "function" &&
        typeof navigator.credentials.get === "function"
      );
      setWebAuthnSupported(supported);

      if (!supported) {
        setModalError(
          "WebAuthn/Passkeys are not supported in this browser. Please use Chrome, Safari, or Edge."
        );
      }
    }
  }, []);

  const handleCreateWallet = async () => {
    try {
      setModalError("");

      if (!webAuthnSupported) {
        throw new Error("WebAuthn is not supported in this browser");
      }

      
      const result = await createWallet();

      // Store auth info
      localStorage.setItem("authToken", result.token);

      // Call success callback
      onSuccess(result.walletAddress, result.token);
      onClose();
    } catch (error) {
      console.error("❌ Wallet creation error:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Failed to create wallet";
      
      // Check if it's a NotAllowedError (user cancelled or timed out)
      if (error instanceof Error && (
        error.name === 'NotAllowedError' || 
        error.message === 'NotAllowedError' ||
        error.message.includes('not allowed') ||
        error.message.includes('timed out')
      )) {
        toast.error("Error creating wallet with passkey", {
          description: "Creation was cancelled or timed out. Please try again."
        });
        // Don't set modalError for NotAllowedError to avoid showing it in UI
      } else {
        toast.error("Error al crear wallet", {
          description: errorMsg
        });
      }
    }
  };

  const handleAuthenticate = async () => {
    try {
      setModalError("");

      if (!webAuthnSupported) {
        throw new Error("WebAuthn is not supported in this browser");
      }

      
      const result = await authenticate();

      // Store auth info
      localStorage.setItem("authToken", result.token);

      // Call success callback
      onSuccess(result.walletAddress, result.token);
      onClose();
    } catch (error) {
      console.error("❌ Authentication error:", error);
      const errorMsg =
        error instanceof Error ? error.message : "Failed to authenticate";
      
      // Check if it's a NotAllowedError (user cancelled or timed out)
      if (error instanceof Error && (
        error.name === 'NotAllowedError' || 
        error.message === 'NotAllowedError' ||
        error.message.includes('not allowed') ||
        error.message.includes('timed out')
      )) {
        toast.error("Error al autenticarse con passkey", {
          description: "La autenticación fue cancelada o expiró. Inténtalo de nuevo."
        });
        // Don't set modalError for NotAllowedError to avoid showing it in UI
      } else {
        toast.error("Error de autenticación", {
          description: errorMsg
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md bg-background/95 border border-border backdrop-blur-xl"
        aria-describedby="passkey-modal-description"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#F0E7CC]" />
            Passkey Wallet
          </DialogTitle>
        </DialogHeader>
        <p id="passkey-modal-description" className="sr-only">
          Create or access your Stellar wallet using biometric authentication
        </p>

        <div className="space-y-4">
          {/* Create New Wallet */}
          <Card className="bg-black/70 border border-border/50">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#F0E7CC]" />
                Create New Wallet
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Create a new Stellar wallet secured by your biometric
                authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShineBorder
                borderWidth={2}
                duration={12}
                color={["#F0E7CC", "#E9F8D8", "#FFFFFF"]}
                className="w-full"
              >
                <Button
                  onClick={handleCreateWallet}
                  disabled={isLoading || !webAuthnSupported}
                  className="w-full h-12 bg-black text-white hover:bg-gray-800 rounded-2xl px-4 font-semibold shadow-lg transition-all border-2 border-[#F0E7CC]/40 hover:border-[#F0E7CC]/60 golden-border-animated"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                      <span className="!text-white">Creating...</span>
                    </>
                  ) : (
                    <div className="flex items-center">
                      <Plus className="mr-2 h-4 w-4 text-white" />
                      <span className="!text-white">
                        Create Wallet with Passkey
                      </span>
                    </div>
                  )}
                </Button>
              </ShineBorder>
            </CardContent>
          </Card>

          {/* Login with Existing Passkey */}
          <Card className="bg-black/70 border border-border/50">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-[#F0E7CC]" />
                Access Existing Wallet
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Use your existing passkey to access your Stellar wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShineBorder
                borderWidth={2}
                duration={12}
                color={["#F0E7CC", "#E9F8D8", "#FFFFFF"]}
                className="w-full"
              >
                <Button
                  onClick={handleAuthenticate}
                  disabled={isLoading || !webAuthnSupported}
                  className="w-full h-12 bg-black hover:bg-gray-800 rounded-2xl px-4 font-semibold shadow-lg transition-all border-2 border-[#F0E7CC]/40 hover:border-[#F0E7CC]/60 golden-border-animated !text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                      <span className="!text-white">Authenticating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <KeyRound className="mr-2 h-4 w-4 text-white" />
                      <span className="!text-white">
                        Access Existing Wallet
                      </span>
                    </div>
                  )}
                </Button>
              </ShineBorder>
            </CardContent>
          </Card>



          {/* Info */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your passkey creates and secures a real Stellar blockchain wallet
              automatically
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
