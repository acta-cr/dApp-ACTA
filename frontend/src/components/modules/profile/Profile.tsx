"use client";

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/components/modules/auth/hooks/wallet.hook';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { Keypair } from '@stellar/stellar-sdk';
import { toast } from 'sonner';
import { useWalletContext } from '@/providers/wallet.provider';
import { userService } from '@/services/user.service';

export function Profile() {
  const { isConnected, walletAddress } = useWallet();
  const { userProfile } = useWalletContext();
  const [copied, setCopied] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [walletSecret, setWalletSecret] = useState<string | null>(null);
  const [credentialId, setCredentialId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // API Key states
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Generate wallet secret from stored passkey data
  const generateWalletFromPasskey = async (credentialId: string, rawId: string): Promise<{ keypair: Keypair; address: string; secret: string }> => {
    // Use credential ID and raw ID as entropy for deterministic key generation
    const combinedData = new TextEncoder().encode(credentialId + rawId)
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', combinedData)
    const entropy = new Uint8Array(hashBuffer)

    // Generate Stellar keypair from entropy
    const keypair = Keypair.fromRawEd25519Seed(Buffer.from(entropy))

    return {
      keypair,
      address: keypair.publicKey(),
      secret: keypair.secret()
    }
  }

  // Load wallet information from localStorage
  useEffect(() => {
    const loadWalletInfo = async () => {
      if (isConnected && walletAddress) {
        const storedCredentialId = localStorage.getItem('passkey_credential_id');
        const storedUserId = localStorage.getItem('passkey_user_id');
        
        if (storedCredentialId && storedUserId) {
          setCredentialId(storedCredentialId);
          setUserId(storedUserId);
          
          // Generate secret key for display (only when needed)
          try {
            // We need to reconstruct the rawId from the credential
            // For now, we'll use the credentialId as rawId since we don't store rawId separately
            const wallet = await generateWalletFromPasskey(storedCredentialId, storedCredentialId);
            setWalletSecret(wallet.secret);
          } catch {
            // Error generating wallet secret
          }
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

  const toggleSecretKeyVisibility = () => {
    setShowSecretKey(!showSecretKey);
  };

  // API Key handlers
  const handleGenerateApiKey = async () => {
    if (!walletAddress) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      setIsGenerating(true);
      const newApiKey = await userService.generateApiKey(walletAddress);
      setGeneratedKey(newApiKey);
      setShowKey(true);
      toast.success("API Key generated successfully!");
    } catch {
      toast.error("Error generating API Key");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateApiKey = async () => {
    if (!walletAddress) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      setIsRegenerating(true);
      // First revoke the existing key, then generate a new one
      await userService.revokeApiKey(walletAddress);
      const newApiKey = await userService.generateApiKey(walletAddress);
      setGeneratedKey(newApiKey);
      setShowKey(true);
      toast.success("API Key regenerated successfully!");
    } catch {
      toast.error("Error regenerating API Key");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDeleteApiKey = async () => {
    if (!walletAddress) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      setIsDeleting(true);
      await userService.revokeApiKey(walletAddress);
      setGeneratedKey(null);
      setShowKey(false);
      toast.success("API Key deleted successfully");
    } catch {
      toast.error("Error deleting API Key");
    } finally {
      setIsDeleting(false);
    }
  };



  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">Your wallet information and connection details</p>
        </div>

        <Alert className="bg-orange-500/10 border-orange-500/20 rounded-2xl">
          <Wallet className="h-4 w-4" />
          <AlertTitle className="text-orange-400">Wallet Connection Required</AlertTitle>
          <AlertDescription className="text-orange-300/80">
            Connect your Stellar wallet to view your profile information and manage your account.
          </AlertDescription>
        </Alert>

        <Card className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                <Wallet className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl mb-2">No Wallet Connected</CardTitle>
              <CardDescription className="mb-6">
                Connect your Stellar wallet to view your profile information and manage your account.
              </CardDescription>
              <Button variant="default" className="bg-black text-white hover:bg-gray-800 rounded-2xl h-12 px-6 font-semibold shadow-lg transition-all border-2 border-[#F0E7CC]/40 hover:border-[#F0E7CC]/60 golden-border-animated">
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-1">Your wallet information and connection details</p>
      </div>

      {/* Main Profile Card */}
      <Card className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="h-20 w-20 border-2 border-[#F0E7CC] shadow-[0_0_10px_rgba(240,231,204,0.3)]">
              <AvatarFallback className="bg-black text-[#F0E7CC] text-xl font-bold">
                {walletAddress?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold golden-gradient-text">{walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}` : 'Stellar Wallet'}</h2>
                <p className="text-muted-foreground">Connected to ACTA dApp</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className="bg-[#F0E7CC]/20 text-[#F0E7CC] border-[#F0E7CC]/30 backdrop-blur-sm rounded-2xl">
                  <div className="w-2 h-2 bg-[#F0E7CC] rounded-full mr-2"></div>
                  Connected
                </Badge>
                <Badge variant="outline" className="border-white/20 text-muted-foreground backdrop-blur-sm rounded-2xl">Testnet</Badge>
                <Badge variant="outline" className="border-white/20 text-muted-foreground backdrop-blur-sm rounded-2xl">Verified</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-background/60 backdrop-blur-xl border border-white/10 rounded-2xl">
          <TabsTrigger value="details" className="data-[state=active]:bg-white/10 rounded-xl">
            <Wallet className="w-4 h-4 mr-2" />
            Wallet Details
          </TabsTrigger>
          <TabsTrigger value="api-key" className="data-[state=active]:bg-white/10 rounded-xl">
            <Key className="w-4 h-4 mr-2" />
            API Key
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-white/10 rounded-xl">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="space-y-4 sm:space-y-6">

              <Card className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center golden-gradient-text">
                    <Wallet className="w-5 h-5 mr-2" style={{ color: '#F0E7CC' }} />
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
                        {walletAddress ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}` : ''}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(walletAddress!)}
                        className="flex-shrink-0"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Your Stellar public key used for identification and transactions
                    </p>
                  </div>

                  {/* Secret Key */}
                  {walletSecret && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center mb-2">
                        <Key className="w-4 h-4 mr-1" />
                        Secret Key
                      </label>
                      <div className="flex items-center space-x-3 p-4 bg-red-500/10 backdrop-blur-sm rounded-lg border border-red-500/20">
                        <code className="flex-1 text-sm text-foreground font-mono break-all">
                          {showSecretKey ? walletSecret : '•'.repeat(56)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleSecretKeyVisibility}
                          className="flex-shrink-0"
                        >
                          {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        {showSecretKey && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(walletSecret)}
                            className="flex-shrink-0"
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-red-400/70 mt-1">
                        ⚠️ Keep this private! Never share your secret key with anyone.
                      </p>
                    </div>
                  )}

                  {/* Passkey Information */}
                  {(credentialId || userId) && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center mb-2">
                        <Shield className="w-4 h-4 mr-1" />
                        Passkey Information
                      </label>
                      <div className="space-y-3">
                        {credentialId && (
                          <div className="flex justify-between items-center p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                            <span className="text-sm text-muted-foreground">Credential ID</span>
                            <div className="flex items-center space-x-2">
                              <code className="text-xs text-foreground bg-white/5 backdrop-blur-sm px-2 py-1 rounded border border-white/10 max-w-xs truncate">
                                {credentialId.slice(0, 8)}...{credentialId.slice(-8)}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(credentialId)}
                              >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              </Button>
                            </div>
                          </div>
                        )}
                        {userId && (
                          <div className="flex justify-between items-center p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                            <span className="text-sm text-muted-foreground">User ID</span>
                            <div className="flex items-center space-x-2">
                              <code className="text-xs text-foreground bg-white/5 backdrop-blur-sm px-2 py-1 rounded border border-white/10 max-w-xs truncate">
                                {userId.slice(0, 8)}...{userId.slice(-8)}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(userId)}
                              >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              </Button>
                            </div>
                          </div>
                        )}
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
                      className="w-full justify-start border-[#F0E7CC]/30 text-[#F0E7CC] hover:bg-[#F0E7CC]/10 backdrop-blur-sm rounded-lg"
                      onClick={() => window.open(`https://stellar.expert/explorer/testnet/account/${walletAddress}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on Testnet
                    </Button>
                      <p className="text-xs text-muted-foreground/70">
                        Check your balance, transaction history, and account details
                      </p>
                    </div>
                  </div>

                </CardContent>
              </Card>

          </div>
        </TabsContent>

        <TabsContent value="api-key" className="space-y-6">
          <Card className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="w-5 h-5 mr-2" />
                API Key Management
              </CardTitle>
              <CardDescription>
                Generate and manage your API key for accessing ACTA services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* API Key Status */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${userProfile?.has_api_key ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium">
                      Status: {userProfile?.has_api_key ? 'Active' : 'No API Key'}
                    </span>
                  </div>
                  {userProfile?.has_api_key && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Generated
                    </Badge>
                  )}
                </div>

                {/* API Key Display */}
                {generatedKey && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-[#F0E7CC]">
                      Your API Key
                    </label>
                    <div className="relative">
                      <div className="flex items-center space-x-2 p-3 bg-background/60 border border-white/10 rounded-lg">
                        <code className="flex-1 text-sm font-mono text-[#F0E7CC] break-all">
                          {showKey ? generatedKey : '•'.repeat(32)}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowKey(!showKey)}
                          className="text-[#F0E7CC] hover:bg-[#F0E7CC]/10"
                        >
                          {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedKey);
                            toast.success("API Key copied to clipboard!");
                          }}
                          className="text-[#F0E7CC] hover:bg-[#F0E7CC]/10"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Alert className="bg-yellow-500/10 border-yellow-500/20 rounded-lg">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="text-yellow-400">Important</AlertTitle>
                      <AlertDescription className="text-yellow-400/80">
                        Store this API key securely. You won&apos;t be able to see it again after leaving this page.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {!userProfile?.has_api_key ? (
                    <Button
                      onClick={handleGenerateApiKey}
                      disabled={isGenerating}
                      className="flex-1 bg-[#F0E7CC] text-black hover:bg-[#F0E7CC]/90 rounded-lg"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Key className="w-4 h-4 mr-2" />
                          Generate API Key
                        </>
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleRegenerateApiKey}
                        disabled={isRegenerating}
                        variant="outline"
                        className="flex-1 border-[#F0E7CC]/30 text-[#F0E7CC] hover:bg-[#F0E7CC]/10 rounded-lg"
                      >
                        {isRegenerating ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Regenerate
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleDeleteApiKey}
                        disabled={isDeleting}
                        variant="destructive"
                        className="flex-1 rounded-lg"
                      >
                        {isDeleting ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <Separator className="bg-white/10" />

              {/* API Key Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#F0E7CC]">How to use your API Key</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-background/60 border border-white/10 rounded-lg">
                    <h4 className="font-medium text-[#F0E7CC] mb-2">Authentication Header</h4>
                    <code className="text-sm text-muted-foreground block bg-background/40 p-2 rounded border">
                      Authorization: Bearer YOUR_API_KEY
                    </code>
                  </div>
                  <div className="p-4 bg-background/60 border border-white/10 rounded-lg">
                    <h4 className="font-medium text-[#F0E7CC] mb-2">Example Request</h4>
                    <code className="text-sm text-muted-foreground block bg-background/40 p-2 rounded border whitespace-pre-wrap">
{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     https://api.acta.com/v1/credentials`}
                    </code>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <Alert className="bg-blue-500/10 border-blue-500/20 rounded-lg">
                <Shield className="h-4 w-4" />
                <AlertTitle className="text-blue-400">Security Best Practices</AlertTitle>
                <AlertDescription className="text-blue-400/80">
                  • Never share your API key publicly or commit it to version control
                  <br />
                  • Regenerate your key if you suspect it has been compromised
                  <br />
                  • Use environment variables to store your API key in applications
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
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
                <AlertTitle className="text-[#F0E7CC]">Settings Available</AlertTitle>
                <AlertDescription className="text-[#F0E7CC]/80">
                  Additional wallet settings and preferences will be available in future updates.
                </AlertDescription>
              </Alert>

              <Card className="bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Having issues with your wallet connection or need assistance?
                  </p>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-white/20 text-foreground hover:bg-white/5 backdrop-blur-sm rounded-2xl"
                    onClick={() => window.open('https://acta.gitbook.io/docs', '_blank')}
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