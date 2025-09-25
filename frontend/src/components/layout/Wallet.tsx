"use client";

import * as React from "react";
import { useWallet } from "@/components/modules/auth/hooks/wallet.hook";
import {
  Copy,
  LogOut,
  ChevronDown,
  Wallet as WalletIcon,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useWalletContext } from "@/providers/wallet.provider";
import { Card } from "@/components/ui/card";
import useIsMobile from "@/hooks/useIsMobile";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Wallet connection/disconnection button component
 * Shows different states based on wallet connection status
 */
export const Wallet = () => {
  const { handleConnect, handleDisconnect } = useWallet();
  const { walletAddress, walletName } = useWalletContext();
  const isMobile = useIsMobile();
  const [copied, setCopied] = useState(false);

  const formatAddress = (address: string, chars = 4) => {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy address");
    }
  };

  if (walletAddress) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-10 px-4 gap-2 font-medium bg-transparent"
          >
            <WalletIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{walletName}</span>
            <span className="font-mono text-sm text-muted-foreground hidden sm:inline">
              {formatAddress(walletAddress, 3)}
            </span>
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-0"
          align={isMobile ? "center" : "end"}
          avoidCollisions
          collisionPadding={8}
        >
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WalletIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{walletName}</span>
              </div>
              <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                Connected
              </span>
            </div>

            <Card className="p-3">
              <p className="text-xs text-muted-foreground mb-1">Address</p>
              <p className="font-mono text-sm break-all">{walletAddress}</p>
            </Card>
          </div>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={() => copyToClipboard(walletAddress)}
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
                onClick={handleDisconnect}
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Button onClick={handleConnect} className="gap-2">
      <WalletIcon className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
};

export default Wallet;