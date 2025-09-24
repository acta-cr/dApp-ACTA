"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Shield,
  CheckCircle,
  XCircle,
  ExternalLink,
  Clock,
  User,
  Building,
  Tag,
  Calendar,
  Loader2
} from 'lucide-react';
import { apiService, CredentialContract } from '@/services/api.service';
import { Particles } from '@/components/magicui/particles';

function VerifyPageContent() {
  const searchParams = useSearchParams();
  const [credential, setCredential] = useState<CredentialContract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const credentialId = searchParams.get('id');
    const issuerAddress = searchParams.get('issuer');

    if (!credentialId || !issuerAddress) {
      setError('Invalid verification link. Missing credential ID or issuer address.');
      setIsLoading(false);
      return;
    }

    verifyCredential(credentialId, issuerAddress);
  }, [searchParams]);

  const verifyCredential = async (credentialId: string, issuerAddress: string) => {
    try {
      setIsLoading(true);
      const result = await apiService.verifyCredential(credentialId, issuerAddress);
      
      if (result.success && result.credential) {
        setCredential(result.credential);
      } else {
        setError(result.message || 'Credential not found or invalid on the Stellar network.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to verify credential. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-[#1B1F2E]" />
          <Particles
            className="absolute inset-0 z-[1]"
            quantity={60}
            staticity={40}
            ease={70}
            size={0.4}
            vx={0}
            vy={0}
            color="#ffffff"
          />
        </div>

        <div className="relative z-[5] flex items-center justify-center p-4 min-h-screen">
          <Card className="p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Verifying Credential</h2>
            <p className="text-sm text-muted-foreground">
              Checking credential authenticity on the Stellar blockchain...
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-[#1B1F2E]" />
          <Particles
            className="absolute inset-0 z-[1]"
            quantity={60}
            staticity={40}
            ease={70}
            size={0.4}
            vx={0}
            vy={0}
            color="#ffffff"
          />
        </div>

        <div className="relative z-[5] flex items-center justify-center p-4 min-h-screen">
          <Card className="p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-lg bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Verification Failed</h2>
            <p className="text-sm text-muted-foreground mb-6">{error}</p>
            <Button
              onClick={() => window.location.href = '/'}
              variant="destructive"
            >
              Go to ACTA
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!credential) {
    return null;
  }

  const expired = isExpired(credential.expiresAt);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-[#1B1F2E]" />
        <Particles
          className="absolute inset-0 z-0"
          quantity={60}
          staticity={40}
          ease={70}
          size={0.4}
          vx={0}
          vy={0}
          color="#ffffff"
        />
      </div>

      <div className="relative z-[5] flex items-center justify-center p-4 min-h-screen">
        <div className="w-full max-w-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground">Credential Verification</h1>
            <p className="text-sm text-muted-foreground">
              Verified on the Stellar blockchain
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge 
              variant={expired ? "destructive" : "default"}
              className="px-4 py-2"
            >
              {expired ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Expired
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Valid
                </>
              )}
            </Badge>
          </div>

          {/* Credential Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                {credential.category}
              </CardTitle>
              <CardDescription>
                Issued by {credential.issuer}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{credential.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Issued:</span>
                    <span className="ml-2">{new Date(credential.issuedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Expires:</span>
                    <span className="ml-2">{new Date(credential.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Building className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Issuer:</span>
                    <span className="ml-2 font-mono text-xs">{credential.issuer.slice(0, 8)}...</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Holder:</span>
                    <span className="ml-2 font-mono text-xs">{credential.holder.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>

              {credential.claims && Object.keys(credential.claims).length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-2">Claims</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(credential.claims).map(([key, value], index) => (
                        <Badge key={index} variant="outline">
                          {key}: {String(value)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://stellar.expert/explorer/testnet/account/${credential.issuer}`, '_blank')}
                  className="flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Issuer on Stellar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://stellar.expert/explorer/testnet/account/${credential.holder}`, '_blank')}
                  className="flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Holder on Stellar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Powered by ACTA • Verified on Stellar Blockchain
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-[#1B1F2E]" />
          <Particles
            className="absolute inset-0 z-[1]"
            quantity={60}
            staticity={40}
            ease={70}
            size={0.4}
            vx={0}
            vy={0}
            color="#ffffff"
          />
        </div>
        <div className="relative z-[5] flex items-center justify-center p-4 min-h-screen">
          <Card className="p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Loading...</h2>
            <p className="text-sm text-muted-foreground">Preparing verification page...</p>
          </Card>
        </div>
      </div>
    }>
      <VerifyPageContent />
    </Suspense>
  );
}