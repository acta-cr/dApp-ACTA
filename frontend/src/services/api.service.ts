export interface CredentialContract {
  id: string;
  holder: string;
  issuer: string;
  category: string;
  description: string;
  issuedAt: string;
  expiresAt: string;
  claims: Record<string, string | number | boolean>;
  schema?: string;
  contractAddress: string;
  transactionHash: string;
  hash?: string; // Credential hash for verification
  verificationUrl: string;
  qrCode?: string; // QR code data URL for local display
  customization?: {
    selectedGradient?: string;
    customGradient?: { start: string; end: string };
    selectedLogo?: string;
    customLogoUrl?: string;
    customLogoText?: string;
    selectedTemplate?: string;
  };
}

export interface CreateCredentialRequest {
  templateId?: string; // Template UUID, we'll use a fixed one for MVP
  data?: Record<string, string | number | boolean>; // Credential specific data
  holder: string;
  category: string;
  description: string;
  expiresAt: string;
  claims?: Record<string, string | number | boolean>;
  schema?: string;
  issuerWallet?: string; // Add wallet address of the issuer
}

export interface CreateCredentialResponse {
  success: boolean;
  credential: CredentialContract;
  message: string;
}

export interface VerifyCredentialResponse {
  success: boolean;
  credential: CredentialContract | null;
  message: string;
}

export class APIService {
  private baseURL: string;

  constructor() {
    this.baseURL = this.getApiUrl();
    console.log('API Service initialized with baseURL:', this.baseURL);
  }

  /**
   * Generate a mock Stellar contract ID for development
   */
  private generateMockContractId(): string {
    // Generate a valid Stellar contract ID format (starts with C, 56 characters total)
    const randomBytes = Array.from({length: 28}, () =>
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('').toUpperCase();
    return `C${randomBytes}`;
  }

  /**
   * Generate a mock Stellar transaction hash for development
   */
  private generateMockTransactionHash(): string {
    // Generate a valid 64-character hex transaction hash
    return Array.from({length: 64}, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  /**
   * Generate a mock credential hash for development
   */
  private generateMockCredentialHash(): string {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Format issuer wallet address to display a friendly name
   */
  private formatIssuerName(issuerWallet?: string): string {
    if (!issuerWallet) {
      return "ACTA";
    }
    
    // If it's a Stellar wallet address (starts with G and is 56 characters)
    if (issuerWallet.startsWith('G') && issuerWallet.length === 56) {
      // Return a shortened version with "ACTA" as the main name
      const shortAddress = `${issuerWallet.slice(0, 4)}...${issuerWallet.slice(-4)}`;
      return `ACTA (${shortAddress})`;
    }
    
    // If it's not a Stellar address, return as is or default
    return issuerWallet || "ACTA";
  }

  private getApiUrl(): string {
    // Use environment variable - fallback for build time
    return process.env.NEXT_PUBLIC_API_URL || 'https://acta-api.vercel.app';
  }

  /**
   * Create a new credential via API (which will deploy to Stellar)
   */
  async createCredential(
    credentialData: CreateCredentialRequest
  ): Promise<CreateCredentialResponse> {
    console.log('Creating credential with data:', credentialData);
    console.log('Using API URL:', `${this.baseURL}/credentials`);
    
    // Prepare data according to API v2 schema
    const apiPayload = {
      data: {
        name: credentialData.holder,
        degree: credentialData.category,
        university: credentialData.issuerWallet || "ACTA",
        description: credentialData.description,
        expiresAt: credentialData.expiresAt,
        ...credentialData.claims
      },
      metadata: {
        issuer: this.formatIssuerName(credentialData.issuerWallet),
        subject: credentialData.holder,
        expirationDate: credentialData.expiresAt
      }
    };

    console.log('API v2 Payload prepared:', apiPayload);
    
    try {
      const response = await fetch(`${this.baseURL}/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      console.log('API Response status:', response.status);
      console.log('API Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error response:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API v2 Success response:', data);
      
      // Log raw API response to understand data structure
      console.log("🔍 Raw API v2 response:", JSON.stringify(data, null, 2));
      
      // Transform API v2 response to match our interface
      const contractId = data.data?.contractId || this.generateMockContractId();
      const transactionHash = data.data?.transactionHash || this.generateMockTransactionHash();
      const ledgerSequence = data.data?.ledgerSequence;
      const createdAt = data.data?.createdAt;
      
      // Check if we have real Stellar contract deployment (not simulated)
      // The backend sends "simulated" transactions with real-looking hashes but they're not on the actual blockchain
      const isRealStellarContract = contractId &&
        data.data?.contractId && // Only real if it came from the API
        contractId.startsWith('C') &&
        contractId.length === 56 &&
        // Check if this is not a simulation (ledgerSequence 12345 indicates simulation)
        ledgerSequence !== 12345;
      
      console.log("🔍 Stellar contract data check:", {
        contractId,
        transactionHash,
        transactionHashLength: transactionHash?.length,
        transactionHashType: typeof transactionHash,
        transactionHashValid: /^[a-f0-9]+$/i.test(transactionHash || ""),
        ledgerSequence,
        isRealStellarContract,
        contractLength: contractId?.length,
        rawApiResponse: data.data
      });

      // Log the exact Stellar Expert URL that will be generated
      if (transactionHash) {
        const stellarUrl = `https://stellar.expert/explorer/testnet/tx/${transactionHash}`;
        console.log("🔗 Stellar Expert URL:", stellarUrl);
      }
      
      // Transform response to match our credential interface
      const transformedResponse: CreateCredentialResponse = {
        success: true,
        credential: {
          id: contractId,
          holder: credentialData.holder,
          issuer: this.formatIssuerName(credentialData.issuerWallet),
          category: credentialData.category,
          description: credentialData.description,
          issuedAt: createdAt || new Date().toISOString(),
          expiresAt: credentialData.expiresAt,
          claims: credentialData.claims || {},
          schema: credentialData.schema || "https://schema.org/Certificate",
          contractAddress: contractId,
          transactionHash: transactionHash,
          hash: data.data?.hash || this.generateMockCredentialHash(),
          verificationUrl: `https://verify.acta.io/credentials/${contractId}`,
        },
        message: isRealStellarContract
          ? "Credential deployed to Stellar testnet blockchain! 🎉"
          : ledgerSequence === 12345
            ? "Credential simulated successfully (not on real blockchain)"
            : "Credential created successfully"
      };
      
      return transformedResponse;
    } catch (error) {
      console.error('Error creating credential:', error);
      
      // Provide more specific error messages
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(`Cannot connect to API server at ${this.baseURL}. Please ensure the backend is running.`);
      }
      
      throw error;
    }
  }

  /**
   * Get credential information from Stellar contract
   */
  async getCredentialInfo(contractId: string): Promise<{ hash: string; status: string }> {
    try {
      console.log('Getting credential info for contract:', contractId);
      
      const response = await fetch(`${this.baseURL}/credentials/${contractId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Credential info response:', data);
      
      return {
        hash: data.data?.hash || 'N/A',
        status: data.data?.status || 'Unknown'
      };
    } catch (error) {
      console.error('Error getting credential info:', error);
      throw error;
    }
  }

  /**
   * Verify a credential by ID and issuer
   */
  async verifyCredential(
    credentialId: string,
    issuerAddress: string
  ): Promise<VerifyCredentialResponse> {
    try {
      // Use the new credential info endpoint
      const credentialInfo = await this.getCredentialInfo(credentialId);
      
      // For now, we'll consider any credential with a valid hash as verified
      const isValid = credentialInfo.hash !== 'N/A' && credentialInfo.status === 'Active';
      
      return {
        success: isValid,
        credential: isValid ? {
          id: credentialId,
          holder: 'N/A', // This info is not available from contract
          issuer: issuerAddress,
          category: 'N/A',
          description: 'N/A',
          issuedAt: new Date().toISOString(),
          expiresAt: 'N/A',
          claims: {},
          contractAddress: credentialId,
          transactionHash: credentialInfo.hash,
          verificationUrl: `https://verify.acta.io/credentials/${credentialId}`,
        } : null,
        message: isValid ? 'Credential verified successfully' : 'Credential not found or invalid'
      };
    } catch (error) {
      console.error('Error verifying credential:', error);
      return {
        success: false,
        credential: null,
        message: 'Error verifying credential'
      };
    }
  }

  /**
   * Get all credentials for a user (optional feature)
   * Note: This endpoint is not implemented in API v2 yet
   */
  async getUserCredentials(): Promise<CredentialContract[]> {
    try {
      // For now, return empty array since this endpoint is not implemented in API v2
      console.log('getUserCredentials not implemented in API v2 yet');
      return [];
    } catch (error) {
      console.error('Error fetching user credentials:', error);
      return [];
    }
  }

  /**
   * Get API health status
   */
  async getHealth(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking API health:', error);
      return { status: 'error', message: 'API unreachable' };
    }
  }
}

export const apiService = new APIService();