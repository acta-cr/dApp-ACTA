"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

interface CredentialInfo {
  hash: string;
  contractId: string;
  status: string;
  fullData: {
    name: string;
    description: string;
    issuer: string;
    recipient: string;
    skills: string[];
    dateIssued: string;
    contractId: string;
    status: string;
    createdAt: string;
  };
}

export function SearchCredential() {
  const [searchHash, setSearchHash] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [credentialInfo, setCredentialInfo] = useState<CredentialInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleSearch = async () => {
    if (!searchHash.trim()) {
      toast.error("Please enter a hash");
      return;
    }

    setIsSearching(true);
    setError(null);
    setCredentialInfo(null);

    try {
      const response = await fetch(`http://localhost:4000/v1/credentials/hash/${searchHash.trim()}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setCredentialInfo(data);
      toast.success("Credential found successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      toast.error(`Error searching for hash: ${errorMessage}`);
    } finally {
      setIsSearching(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-gradient-to-r from-[#1B6BFF]/20 to-[#8F43FF]/20 rounded-2xl border border-[#1B6BFF]/30">
          <Search className="w-6 h-6 text-[#1B6BFF]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Search Credential</h1>
          <p className="text-muted-foreground">Search for a credential using its hash</p>
        </div>
      </div>

      {/* Search Form */}
      <Card className="p-6 bg-background/80 backdrop-blur-xl border-white/10">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Credential Hash
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={searchHash}
                onChange={(e) => setSearchHash(e.target.value)}
                placeholder="Enter the credential hash (e.g: 881983b6ec6efe3e6d860f3cbef387f4)"
                className="flex-1 px-4 py-3 bg-background/50 border border-white/20 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#1B6BFF]/50 focus:border-[#1B6BFF]/50"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchHash.trim()}
                className="bg-gradient-to-r from-[#1B6BFF] to-[#8F43FF] text-white hover:from-[#1657CC] hover:to-[#7A36E0] rounded-xl px-6"
              >
                {isSearching ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Searching...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="p-4 bg-red-500/10 border-red-500/20">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div>
              <p className="text-red-400 font-medium">Error searching for credential</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Credential Result */}
      {credentialInfo && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Credential Found</h2>
            <Button
              variant="outline"
              onClick={() => setIsFlipped(!isFlipped)}
              className="border-white/20 text-foreground hover:bg-white/5"
            >
              {isFlipped ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {isFlipped ? 'Hide Details' : 'View Details'}
            </Button>
          </div>

          {/* Credential Card */}
          <div className="perspective-1000">
            <div className={`relative w-full h-64 transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
              {/* Front of Card */}
              <div className="absolute inset-0 w-full h-full backface-hidden">
                <Card className="h-full p-6 bg-gradient-to-br from-[#1B6BFF]/20 to-[#8F43FF]/20 border-[#1B6BFF]/30 backdrop-blur-xl">
                  <div className="flex flex-col h-full justify-between">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-8 h-8 text-[#1B6BFF]" />
                        <div>
                          <h3 className="text-lg font-bold text-foreground">{credentialInfo.fullData.name}</h3>
                          <p className="text-sm text-muted-foreground">{credentialInfo.fullData.issuer}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-sm text-green-400 font-medium">{credentialInfo.status}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-foreground font-medium">{credentialInfo.fullData.recipient}</p>
                      <p className="text-sm text-muted-foreground">{credentialInfo.fullData.description}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {credentialInfo.fullData.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-[#1B6BFF]/20 text-[#1B6BFF] text-xs rounded-lg border border-[#1B6BFF]/30"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Issued: {formatDate(credentialInfo.fullData.dateIssued)}</span>
                      <span>Hash: {credentialInfo.hash.substring(0, 8)}...</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Back of Card */}
              <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                <Card className="h-full p-6 bg-background/80 backdrop-blur-xl border-white/10">
                  <div className="space-y-4 h-full overflow-y-auto">
                    <h3 className="text-lg font-bold text-foreground mb-4">Technical Details</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Contract ID</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <code className="flex-1 px-3 py-2 bg-background/50 border border-white/20 rounded-lg text-xs font-mono text-foreground break-all">
                            {credentialInfo.contractId}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(credentialInfo.contractId, "Contract ID")}
                            className="border-white/20 hover:bg-white/5"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Hash</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <code className="flex-1 px-3 py-2 bg-background/50 border border-white/20 rounded-lg text-xs font-mono text-foreground break-all">
                            {credentialInfo.hash}
                          </code>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(credentialInfo.hash, "Hash")}
                            className="border-white/20 hover:bg-white/5"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Creation Date</label>
                        <p className="text-sm text-foreground mt-1">{formatDate(credentialInfo.fullData.createdAt)}</p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <div className="flex items-center space-x-2 mt-1">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-green-400 font-medium">Valid</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// CSS personalizado para el efecto 3D (agregar al globals.css)
/*
.perspective-1000 {
  perspective: 1000px;
}

.transform-style-preserve-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}
*/