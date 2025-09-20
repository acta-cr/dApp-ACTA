"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fingerprint, Mail, KeyRound } from 'lucide-react';
import { useWallet } from '@/components/modules/auth/hooks/wallet.hook';

interface PasskeyAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasskeyAuthModal: React.FC<PasskeyAuthModalProps> = ({ isOpen, onClose }) => {
  const { handlePasskeySuccess, setIsModalOpen } = useWallet();

  // Local state for form inputs
  const [email, setEmail] = useState<string>('');
  const [invitationToken, setInvitationToken] = useState<string>('');

  // Loading states
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState<boolean>(false);

  // Error states
  const [loginError, setLoginError] = useState<string>('');
  const [registerError, setRegisterError] = useState<string>('');

  const handleLogin = async () => {
    if (!email) {
      setLoginError('Email is required');
      return;
    }

    try {
      setLoginError('');
      setIsLoggingIn(true);

      // TODO: Implement actual passkey login logic
      // For now, this is a placeholder that simulates successful login
      const mockWalletAddress = 'GCKFBEIYTKP6RQHG...'; // Mock Stellar address
      const mockToken = 'mock_auth_token_' + Date.now();

      await handlePasskeySuccess(mockWalletAddress, mockToken);
      setIsModalOpen(false);
      onClose();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async () => {
    if (!invitationToken) {
      setRegisterError('Invitation token is required');
      return;
    }

    try {
      setRegisterError('');
      setIsCreatingWallet(true);

      // TODO: Implement actual passkey registration logic
      // For now, this is a placeholder that simulates successful registration
      const mockWalletAddress = 'GCKFBEIYTKP6RQHG...'; // Mock Stellar address
      const mockToken = 'mock_auth_token_' + Date.now();

      await handlePasskeySuccess(mockWalletAddress, mockToken);
      setIsModalOpen(false);
      onClose();
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsCreatingWallet(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[rgba(255,255,255,0.03)] border border-white/10 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            Passkey Authentication
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[rgba(255,255,255,0.05)]">
            <TabsTrigger value="login" className="text-white/70 data-[state=active]:text-white">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="text-white/70 data-[state=active]:text-white">
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            <Card className="bg-[rgba(255,255,255,0.02)] border border-white/5">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Fingerprint className="w-5 h-5" />
                  Login with Passkey
                </CardTitle>
                <CardDescription className="text-white/60">
                  Use your biometric authentication to access your Stellar wallet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/80">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-[rgba(255,255,255,0.05)] border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {loginError}
                  </div>
                )}

                <Button
                  onClick={handleLogin}
                  disabled={!email || isLoggingIn}
                  className="w-full bg-gradient-to-r from-[#1B6BFF] to-[#8F43FF] text-white hover:from-[#1657CC] hover:to-[#7A36E0] rounded-2xl h-12 px-6 font-semibold shadow-lg transition-all"
                >
                  {isLoggingIn ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-4 h-4 mr-2" />
                      Login with Passkey
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register" className="space-y-4">
            <Card className="bg-[rgba(255,255,255,0.02)] border border-white/5">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5" />
                  Create Wallet with Passkey
                </CardTitle>
                <CardDescription className="text-white/60">
                  Register a new Stellar wallet secured by your biometric authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invitationToken" className="text-white/80">Invitation Token</Label>
                  <Input
                    id="invitationToken"
                    type="text"
                    placeholder="Enter your invitation token"
                    value={invitationToken}
                    onChange={(e) => setInvitationToken(e.target.value)}
                    className="bg-[rgba(255,255,255,0.05)] border-white/10 text-white placeholder:text-white/40"
                  />
                </div>

                {registerError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {registerError}
                  </div>
                )}

                <Button
                  onClick={handleRegister}
                  disabled={!invitationToken || isCreatingWallet}
                  className="w-full bg-gradient-to-r from-[#1B6BFF] to-[#8F43FF] text-white hover:from-[#1657CC] hover:to-[#7A36E0] rounded-2xl h-12 px-6 font-semibold shadow-lg transition-all"
                >
                  {isCreatingWallet ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating Wallet...
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4 mr-2" />
                      Create Wallet
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};