import { useState } from 'react'
import { nativeWebauthnService } from '@/services/native-webauthn.service'

export interface CreateWalletResult {
  status: string
  token: string
  walletAddress: string
  message: string
}

export interface AuthenticateResult {
  token: string
  walletAddress: string
  message: string
}

// Backend base URL (ACTA-Backend)
const getBackendUrl = () => process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

// Helper function to get the correct RP ID based on environment
const getRpId = () => {
  if (typeof window === 'undefined') return 'localhost'
  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'localhost'
  return hostname
}

// Fetch registration options from backend
const getRegistrationOptions = async () => {
  const resp = await fetch(`${getBackendUrl()}/auth/webauthn/register/options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({}),
  })
  if (!resp.ok) throw new Error('Failed to get registration options')
  const data = await resp.json()
  return data.options
}

// Types for WebAuthn JSON payloads sent to backend
interface RegistrationResponseJSON {
  id: string
  rawId: string
  response: {
    clientDataJSON: string
    attestationObject: string
    transports?: AuthenticatorTransport[]
  }
  type: 'public-key'
}

interface AuthenticationResponseJSON {
  id: string
  rawId: string
  response: {
    clientDataJSON: string
    authenticatorData: string
    signature: string
    userHandle: string | null
  }
  type: 'public-key'
}

// Verify registration response on backend
const verifyRegistration = async (response: RegistrationResponseJSON) => {
  const resp = await fetch(`${getBackendUrl()}/auth/webauthn/register/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ response }),
  })
  if (!resp.ok) throw new Error('Failed to verify registration')
  return await resp.json()
}

// Fetch authentication options from backend
const getAuthenticationOptions = async () => {
  const resp = await fetch(`${getBackendUrl()}/auth/webauthn/login/options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({}),
  })
  if (!resp.ok) throw new Error('Failed to get authentication options')
  const data = await resp.json()
  return data.options
}

// Verify authentication response on backend
const verifyAuthentication = async (response: AuthenticationResponseJSON) => {
  const resp = await fetch(`${getBackendUrl()}/auth/webauthn/login/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ response }),
  })
  if (!resp.ok) throw new Error('Failed to verify authentication')
  return await resp.json()
}

// Load wallet info from backend (avoid 304 by cache-busting)
const getWalletMe = async () => {
  // First try with cache-busting query param to prefer 200 responses
  let resp = await fetch(`${getBackendUrl()}/wallets/me?ts=${Date.now()}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Cache-Control': 'no-cache' },
  })
  // If some proxy returns 304, retry with a new timestamp
  if (!resp.ok) {
    if (resp.status === 304) {
      resp = await fetch(`${getBackendUrl()}/wallets/me?ts=${Date.now() + 1}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' },
      })
    }
  }
  if (!resp.ok) throw new Error('Failed to fetch wallet info')
  return await resp.json()
}

// Helper function to activate wallet on Stellar testnet using friendbot
const activateWalletOnTestnet = async (publicKey: string): Promise<boolean> => {
  try {

    // Use Stellar's friendbot to fund the account
    const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`)

    if (response.ok) {
      return true
    } else {
      console.warn('⚠️ Friendbot funding failed:', response.status)
      return false
    }
  } catch {
    return false
  }
}

export const useSimplePasskey = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create new wallet with passkey - backend verified
  const createWallet = async (): Promise<CreateWalletResult> => {
    try {
      setIsLoading(true)
      setError(null)

      // Step 1: Get registration options from backend
      const optionsJSON = await getRegistrationOptions()

      // Step 2: Create passkey using native WebAuthn
      const { rawResponse } = await nativeWebauthnService.createPasskey({ optionsJSON })

      // Step 3: Verify registration with backend (sets session cookie)
      await verifyRegistration(rawResponse as unknown as RegistrationResponseJSON)

      // Step 4: Fetch wallet info from backend
      const me = await getWalletMe()
      const walletAddress = me.publicKey || me.walletAddress
      const token = 'session'

      return {
        status: 'success',
        token,
        walletAddress,
        message: 'Wallet created successfully with passkey authentication'
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Wallet creation failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Authenticate with existing passkey - backend verified
  const authenticate = async (): Promise<AuthenticateResult> => {
    try {
      setIsLoading(true)
      setError(null)

      // Step 1: Get authentication options from backend
      const optionsJSON = await getAuthenticationOptions()


      // Step 3: Authenticate with native passkey
      const { rawResponse } = await nativeWebauthnService.authenticateWithPasskey({ optionsJSON })

      // Step 4: Verify authentication on backend (sets session cookie)
      await verifyAuthentication(rawResponse as unknown as AuthenticationResponseJSON)

      // Step 5: Fetch wallet info from backend
      const me = await getWalletMe()
      const walletAddress = me.publicKey || me.walletAddress
      const token = 'session'

      return {
        token,
        walletAddress,
        message: 'Authentication successful'
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createWallet,
    authenticate,
    isLoading,
    error,
  }
}