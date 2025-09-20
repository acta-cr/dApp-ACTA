"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fingerprint, Plus, KeyRound } from 'lucide-react';
import { useSimplePasskey } from '@/hooks/use-simple-passkey';

interface SimplePasskeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (walletAddress: string, token: string) => void;
}

export const SimplePasskeyModal: React.FC<SimplePasskeyModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { createWallet, authenticate, isLoading, error } = useSimplePasskey();
  const [modalError, setModalError] = useState<string>('');

  const handleCreateWallet = async () => {
    try {
      setModalError('');
      const result = await createWallet();

      // Store auth info
      localStorage.setItem('authToken', result.token);

      // Call success callback
      onSuccess(result.walletAddress, result.token);
      onClose();
    } catch (error) {
      setModalError(error instanceof Error ? error.message : 'Failed to create wallet');
    }
  };

  const handleAuthenticate = async () => {
    try {
      setModalError('');
      const result = await authenticate();

      // Store auth info
      localStorage.setItem('authToken', result.token);

      // Call success callback
      onSuccess(result.walletAddress, result.token);
      onClose();
    } catch (error) {
      setModalError(error instanceof Error ? error.message : 'Failed to authenticate');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[rgba(255,255,255,0.03)] border border-white/10 backdrop-blur-xl" aria-describedby="passkey-modal-description">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            Passkey Wallet
          </DialogTitle>
        </DialogHeader>
        <p id="passkey-modal-description" className="sr-only">
          Create or access your Stellar wallet using biometric authentication
        </p>

        <div className="space-y-4">
          {/* Create New Wallet */}
          <Card className="bg-[rgba(255,255,255,0.02)] border border-white/5">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Wallet
              </CardTitle>
              <CardDescription className="text-white/60">
                Create a new Stellar wallet secured by your biometric authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCreateWallet}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#1B6BFF] to-[#8F43FF] text-white hover:from-[#1657CC] hover:to-[#7A36E0] rounded-2xl h-12 px-6 font-semibold shadow-lg transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating Wallet...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Wallet with Passkey
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Login with Existing Passkey */}
          <Card className="bg-[rgba(255,255,255,0.02)] border border-white/5">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Fingerprint className="w-5 h-5" />
                Access Existing Wallet
              </CardTitle>
              <CardDescription className="text-white/60">
                Use your existing passkey to access your Stellar wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleAuthenticate}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#1B6BFF] to-[#8F43FF] text-white hover:from-[#1657CC] hover:to-[#7A36E0] rounded-2xl h-12 px-6 font-semibold shadow-lg transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4 mr-2" />
                    Access with Passkey
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Error Display */}
          {(modalError || error) && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {modalError || error}
            </div>
          )}

          {/* Info */}
          <div className="text-center">
            <p className="text-xs text-white/70 leading-relaxed">
              Your passkey creates and secures a real Stellar blockchain wallet automatically
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};