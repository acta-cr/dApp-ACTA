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
import { useSimplePasskey } from "@/hooks/use-simple-passkey";
import { toast } from "sonner";
import { ShimmerButton } from "@/components/ui/shimmer-button";

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
  const { createWallet, authenticate, isLoading } = useSimplePasskey();
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
      const errorMsg =
        error instanceof Error ? error.message : "Failed to create wallet";

      // Check if it's a NotAllowedError (user cancelled or timed out)
      if (
        error instanceof Error &&
        (error.name === "NotAllowedError" ||
          error.message === "NotAllowedError" ||
          error.message.includes("not allowed") ||
          error.message.includes("timed out"))
      ) {
        toast.error("Error creating wallet with passkey", {
          description: "Creation was cancelled or timed out. Please try again.",
        });
        // Don't set modalError for NotAllowedError to avoid showing it in UI
      } else {
        toast.error("Wallet creation error", {
          description: errorMsg,
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
      const errorMsg =
        error instanceof Error ? error.message : "Failed to authenticate";

      // Check if it's a NotAllowedError (user cancelled or timed out)
      if (
        error instanceof Error &&
        (error.name === "NotAllowedError" ||
          error.message === "NotAllowedError" ||
          error.message.includes("not allowed") ||
          error.message.includes("timed out"))
      ) {
        toast.error("Error authenticating with passkey", {
          description:
            "Authentication was cancelled or timed out. Please try again.",
        });
        // Don't set modalError for NotAllowedError to avoid showing it in UI
      } else {
        toast.error("Authentication error", {
          description: errorMsg,
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
              <ShimmerButton className="shadow-2xl">
                <Button
                  onClick={handleCreateWallet}
                  disabled={isLoading || !webAuthnSupported}
                  className="w-full h-12 rounded-2xl px-4 font-semibold bg-black text-white hover:bg-gray-800 border-gray-600"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <div className="flex items-center">
                      <Plus className="mr-2 h-4 w-4" />
                      <span>Create Wallet with Passkey</span>
                    </div>
                  )}
                </Button>
              </ShimmerButton>
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
              <ShimmerButton className="shadow-2xl">
                <Button
                  onClick={handleAuthenticate}
                  disabled={isLoading || !webAuthnSupported}
                  variant="outline"
                  className="w-full h-12 rounded-2xl px-4 font-semibold bg-black text-white hover:bg-gray-800 border-gray-600"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Accessing...</span>
                    </>
                  ) : (
                    <div className="flex items-center">
                      <KeyRound className="mr-2 h-4 w-4" />
                      <span>Access Existing Wallet</span>
                    </div>
                  )}
                </Button>
              </ShimmerButton>
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
