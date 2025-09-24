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
      // Get API URL from environment or use default
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/credentials/hash/${searchHash.trim()}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Credential not found with the provided hash");
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error("Invalid response from server");
      }

      setCredentialInfo(result.data);
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
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Search className="w-5 h-5 text-[#F0E7CC]" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Search Credential</h1>
          <p className="text-sm text-muted-foreground">Search for a credential using its hash</p>
        </div>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <Hash className="w-4 h-4 mr-2" />
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
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !searchHash.trim()}
                className="px-6"
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
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error searching for credential</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {credentialInfo && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Credential Found</AlertTitle>
          <AlertDescription>
            The credential has been found and verified successfully.
          </AlertDescription>
        </Alert>
      )}

      {/* Credential Results */}
      {credentialInfo && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Credential Details</h2>
            <Button
              variant="outline"
              onClick={() => setIsFlipped(!isFlipped)}
              size="sm"
            >
              {isFlipped ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {isFlipped ? 'Show Card View' : 'Show Table View'}
            </Button>
          </div>

          {!isFlipped ? (
            /* Card View */
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-[#F0E7CC]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{credentialInfo.fullData.name}</h3>
                        <p className="text-sm text-muted-foreground">{credentialInfo.fullData.issuer}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {credentialInfo.status}
                    </Badge>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{credentialInfo.fullData.description}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {credentialInfo.fullData.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
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
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Technical Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Hash</TableCell>
                      <TableCell className="font-mono text-sm">{credentialInfo.hash}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(credentialInfo.hash, "Hash")}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Contract ID</TableCell>
                      <TableCell className="font-mono text-sm">{credentialInfo.contractId}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(credentialInfo.contractId, "Contract ID")}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
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
                      <TableCell className="font-mono text-sm">{credentialInfo.fullData.recipient}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(credentialInfo.fullData.recipient, "Recipient")}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Status</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{credentialInfo.status}</Badge>
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Date Issued</TableCell>
                      <TableCell>{formatDate(credentialInfo.fullData.dateIssued)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Skills</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {credentialInfo.fullData.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
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