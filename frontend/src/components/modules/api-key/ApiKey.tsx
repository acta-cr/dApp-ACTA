"use client";

import React, { useState } from "react";
import { useWallet } from "@/components/modules/auth/hooks/wallet.hook";
import { useWalletContext } from "@/providers/wallet.provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Shield,
  CheckCircle,
  Download,
  RotateCcw,
  Info,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export function ApiKey() {
  const { isConnected } = useWallet();
  const { userProfile, generateApiKey, regenerateApiKey, deleteApiKey } =
    useWalletContext();

  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const handleGenerateApiKey = async () => {
    try {
      setIsGenerating(true);
      const newApiKey = await generateApiKey();
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
    try {
      setIsRegenerating(true);
      const newApiKey = await regenerateApiKey();
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
    try {
      setIsDeleting(true);
      await deleteApiKey();
      setGeneratedKey(null);
      setShowKey(false);
      toast.success("API Key deleted successfully");
    } catch {
      toast.error("Error deleting API Key");
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("API Key copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Error copying API Key");
    }
  };

  const displayKey = generatedKey || userProfile?.api_key;
  const hasApiKey = Boolean(displayKey);

  if (!isConnected) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Key className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">API Key</h1>
            <p className="text-sm text-muted-foreground">Manage your API access keys</p>
          </div>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Wallet Connection Required</AlertTitle>
          <AlertDescription>
            Please connect your wallet to manage your API keys.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Key className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">API Key</h1>
          <p className="text-sm text-muted-foreground">Manage your API access keys</p>
        </div>
      </div>

      {/* API Key Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                API Key Status
              </CardTitle>
              <CardDescription>
                {hasApiKey 
                  ? "Your API key is active and ready to use"
                  : "No API key generated yet"
                }
              </CardDescription>
            </div>
            <Badge variant={hasApiKey ? "secondary" : "outline"}>
              {hasApiKey ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Inactive
                </>
              )}
            </Badge>
          </div>
        </CardHeader>

        {hasApiKey && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">API Key</label>
              <div className="flex items-center space-x-2">
                <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm">
                  {showKey ? displayKey : "•".repeat(32)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(displayKey!)}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleRegenerateApiKey}
                disabled={isRegenerating}
                size="sm"
              >
                {isRegenerating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4 mr-2" />
                )}
                Regenerate
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteApiKey}
                disabled={isDeleting}
                size="sm"
              >
                {isDeleting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete
              </Button>
            </div>
          </CardContent>
        )}

        {!hasApiKey && (
          <CardContent>
            <Button
              onClick={handleGenerateApiKey}
              disabled={isGenerating}
              className="w-full"
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
          </CardContent>
        )}
      </Card>

      {/* Security Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>Security Notice</AlertTitle>
        <AlertDescription>
          Keep your API key secure and never share it publicly. If you suspect it has been compromised, regenerate it immediately.
        </AlertDescription>
      </Alert>

      {/* Usage Information */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Info className="w-4 h-4 mr-2" />
              Usage Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Authentication</h4>
              <p className="text-xs text-muted-foreground">
                Include your API key in the Authorization header as a Bearer token.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Rate Limits</h4>
              <p className="text-xs text-muted-foreground">
                Standard plan includes 1000 requests per hour.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Endpoints</h4>
              <p className="text-xs text-muted-foreground">
                Access all credential management endpoints with your API key.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Documentation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>
              Check out our documentation for detailed API usage examples and
              integration guides.
            </CardDescription>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => window.open('https://acta.gitbook.io/docs', '_blank')}
            >
              <Info className="w-4 h-4 mr-2" />
              View Documentation
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
