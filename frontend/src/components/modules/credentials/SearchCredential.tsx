"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Hash,
  Info,
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
      <Card className="bg-background/80 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            Credential Search
          </CardTitle>
          <CardDescription>
            Enter the unique hash identifier for the credential you want to search for.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="searchHash">Credential Hash</Label>
            <div className="flex space-x-3">
              <Input
                id="searchHash"
                type="text"
                value={searchHash}
                onChange={(e) => setSearchHash(e.target.value)}
                placeholder="Enter the credential hash (e.g: 881983b6ec6efe3e6d860f3cbef387f4)"
                className="flex-1 bg-background/50 border-white/20 text-foreground placeholder-muted-foreground"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchHash.trim()}
                className="bg-gradient-to-r from-[#1B6BFF] to-[#8F43FF] text-white hover:from-[#1657CC] hover:to-[#7A36E0] px-6"
              >
                {isSearching ? (
                  <>
                    <Search className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert className="bg-red-500/10 border-red-500/20 rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-red-400">Error searching for credential</AlertTitle>
          <AlertDescription className="text-red-300/80">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {credentialInfo && (
        <Alert className="bg-green-500/10 border-green-500/20 rounded-2xl">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle className="text-green-400">Credential Found</AlertTitle>
          <AlertDescription className="text-green-300/80">
            Successfully found credential with hash: {credentialInfo.hash.substring(0, 16)}...
          </AlertDescription>
        </Alert>
      )}

      {/* Credential Result */}
      {credentialInfo && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Credential Details</h2>
            <Button
              variant="outline"
              onClick={() => setIsFlipped(!isFlipped)}
              className="border-white/20 text-foreground hover:bg-white/5"
            >
              {isFlipped ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {isFlipped ? 'Show Card View' : 'Show Table View'}
            </Button>
          </div>

          {!isFlipped ? (
            /* Card View */
            <Card className="bg-gradient-to-br from-[#1B6BFF]/20 to-[#8F43FF]/20 border-[#1B6BFF]/30 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-8 h-8 text-[#1B6BFF]" />
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{credentialInfo.fullData.name}</h3>
                        <p className="text-sm text-muted-foreground">{credentialInfo.fullData.issuer}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-400/20 text-green-400 border-green-400/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {credentialInfo.status}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-foreground font-medium">{credentialInfo.fullData.recipient}</p>
                    <p className="text-sm text-muted-foreground">{credentialInfo.fullData.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {credentialInfo.fullData.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-[#1B6BFF]/20 text-[#1B6BFF] border-[#1B6BFF]/30"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Issued: {formatDate(credentialInfo.fullData.dateIssued)}</span>
                    <span>Hash: {credentialInfo.hash.substring(0, 8)}...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Table View */
            <Card className="bg-background/80 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="w-5 h-5 mr-2" />
                  Technical Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-muted-foreground">Property</TableHead>
                      <TableHead className="text-muted-foreground">Value</TableHead>
                      <TableHead className="text-muted-foreground w-20">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Name</TableCell>
                      <TableCell>{credentialInfo.fullData.name}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Issuer</TableCell>
                      <TableCell>{credentialInfo.fullData.issuer}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Recipient</TableCell>
                      <TableCell>{credentialInfo.fullData.recipient}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Contract ID</TableCell>
                      <TableCell>
                        <code className="text-xs bg-background/50 p-1 rounded border">
                          {credentialInfo.contractId.substring(0, 20)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(credentialInfo.contractId, "Contract ID")}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Hash</TableCell>
                      <TableCell>
                        <code className="text-xs bg-background/50 p-1 rounded border">
                          {credentialInfo.hash.substring(0, 20)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(credentialInfo.hash, "Hash")}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Date Issued</TableCell>
                      <TableCell>{formatDate(credentialInfo.fullData.dateIssued)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Created At</TableCell>
                      <TableCell>{formatDate(credentialInfo.fullData.createdAt)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Status</TableCell>
                      <TableCell>
                        <Badge className="bg-green-400/20 text-green-400 border-green-400/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {credentialInfo.status}
                        </Badge>
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
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