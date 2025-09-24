// Interfaces para opciones de WebAuthn
interface WebAuthnUser {
  id: string | ArrayBuffer | { data: number[] };
  name: string;
  displayName: string;
}

interface WebAuthnCredential {
  id: string;
  type: string;
  transports?: AuthenticatorTransport[];
}

interface WebAuthnRegistrationOptions {
  challenge: string | ArrayBuffer;
  rp: PublicKeyCredentialRpEntity;
  user: WebAuthnUser;
  pubKeyCredParams: PublicKeyCredentialParameters[];
  authenticatorSelection?: AuthenticatorSelectionCriteria;
  timeout?: number;
  attestation?: AttestationConveyancePreference;
  excludeCredentials?: WebAuthnCredential[];
  publicKey?: WebAuthnRegistrationOptions;
}

interface WebAuthnAuthenticationOptions {
  challenge: string | ArrayBuffer;
  allowCredentials?: WebAuthnCredential[];
  userVerification?: UserVerificationRequirement;
  timeout?: number;
  rpId?: string;
  publicKey?: WebAuthnAuthenticationOptions;
}

export interface WebAuthnCreatePasskeyInput {
  optionsJSON: WebAuthnRegistrationOptions;
}

export interface WebAuthnCreatePasskeyResult {
  rawResponse: PublicKeyCredential;
  credentialId: string;
}

export interface WebAuthnAuthenticateWithPasskeyInput {
  optionsJSON: WebAuthnAuthenticationOptions;
}

export interface WebAuthnAuthenticateWithPasskeyResult {
  rawResponse: PublicKeyCredential;
  clientDataJSON: string;
  authenticatorData: string;
  signature: string;
}

// Convertir ArrayBuffer a base64url
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Convertir base64url a ArrayBuffer
function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  if (!base64url || typeof base64url !== "string") {
    throw new Error("Invalid base64url input: must be a non-empty string");
  }

  // Agregar padding si es necesario
  base64url = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64url.length % 4) {
    base64url += "=";
  }

  const binary = atob(base64url);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Procesar opciones de registro
function processRegistrationOptions(
  options: WebAuthnRegistrationOptions
): CredentialCreationOptions {
  // Check if options has publicKey property (new format) or is the direct options object (old format)
  const opts = options.publicKey || options;

  return {
    publicKey: {
      challenge:
        typeof opts.challenge === "string"
          ? base64UrlToArrayBuffer(opts.challenge)
          : opts.challenge,
      rp: opts.rp,
      user: {
        id:
          typeof opts.user.id === "string"
            ? base64UrlToArrayBuffer(opts.user.id)
            : opts.user.id instanceof ArrayBuffer
              ? opts.user.id
              : new Uint8Array((opts.user.id as { data: number[] }).data || []),
        name: opts.user.name,
        displayName: opts.user.displayName,
      },
      pubKeyCredParams: opts.pubKeyCredParams,
      authenticatorSelection: opts.authenticatorSelection,
      timeout: opts.timeout,
      attestation: opts.attestation as AttestationConveyancePreference,
      excludeCredentials:
        opts.excludeCredentials?.map((cred: WebAuthnCredential) => ({
          id: base64UrlToArrayBuffer(cred.id),
          type: cred.type as "public-key",
          transports: cred.transports,
        })) || [],
    },
  };
}

// Procesar opciones de autenticación
function processAuthenticationOptions(
  options: WebAuthnAuthenticationOptions
): CredentialRequestOptions {
  // Check if options has publicKey property (new format) or is the direct options object (old format)
  const opts = options.publicKey || options;

  return {
    publicKey: {
      challenge:
        typeof opts.challenge === "string"
          ? base64UrlToArrayBuffer(opts.challenge)
          : opts.challenge,
      allowCredentials:
        opts.allowCredentials?.map((cred: WebAuthnCredential) => ({
          id:
            typeof cred.id === "string"
              ? base64UrlToArrayBuffer(cred.id)
              : cred.id,
          type: cred.type as "public-key",
          transports: cred.transports,
        })) || [],
      userVerification: opts.userVerification as UserVerificationRequirement,
      timeout: opts.timeout,
      rpId: opts.rpId,
    },
  };
}

export class NativeWebAuthnService {
  async createPasskey(
    input: WebAuthnCreatePasskeyInput
  ): Promise<WebAuthnCreatePasskeyResult> {
    try {

      // Verificar soporte de WebAuthn
      if (!navigator.credentials || !navigator.credentials.create) {
        throw new Error("WebAuthn is not supported in this browser");
      }

      // Procesar opciones
      const credentialCreationOptions = processRegistrationOptions(
        input.optionsJSON
      );


      // Crear credencial
      const credential = (await navigator.credentials.create(
        credentialCreationOptions
      )) as PublicKeyCredential;

      if (!credential) {
        throw new Error("Failed to create credential");
      }

      const response = credential.response as AuthenticatorAttestationResponse;

      // Preparar respuesta en formato esperado
      const rawResponse = {
        id: credential.id,
        rawId: arrayBufferToBase64Url(credential.rawId),
        response: {
          clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
          attestationObject: arrayBufferToBase64Url(response.attestationObject),
          transports:
            (
              response as AuthenticatorAttestationResponse & {
                getTransports?: () => AuthenticatorTransport[];
              }
            ).getTransports?.() || [],
        },
        type: credential.type,
      };


      return {
        rawResponse: rawResponse as unknown as PublicKeyCredential,
        credentialId: credential.id,
      };
    } catch (error) {
      console.error("Error creating passkey:", error);
      throw error;
    }
  }

  async authenticateWithPasskey(
    input: WebAuthnAuthenticateWithPasskeyInput
  ): Promise<WebAuthnAuthenticateWithPasskeyResult> {
    try {

      // Verificar soporte de WebAuthn
      if (!navigator.credentials || !navigator.credentials.get) {
        throw new Error("WebAuthn is not supported in this browser");
      }

      // Procesar opciones
      const credentialRequestOptions = processAuthenticationOptions(
        input.optionsJSON
      );


      // Obtener credencial
      const credential = (await navigator.credentials.get(
        credentialRequestOptions
      )) as PublicKeyCredential;

      if (!credential) {
        throw new Error("Failed to authenticate with passkey");
      }

      const response = credential.response as AuthenticatorAssertionResponse;

      // Preparar respuesta
      const rawResponse = {
        id: credential.id,
        rawId: arrayBufferToBase64Url(credential.rawId),
        response: {
          clientDataJSON: arrayBufferToBase64Url(response.clientDataJSON),
          authenticatorData: arrayBufferToBase64Url(response.authenticatorData),
          signature: arrayBufferToBase64Url(response.signature),
          userHandle: response.userHandle
            ? arrayBufferToBase64Url(response.userHandle)
            : null,
        },
        type: credential.type,
      };


      return {
        rawResponse: rawResponse as unknown as PublicKeyCredential,
        clientDataJSON: rawResponse.response.clientDataJSON,
        authenticatorData: rawResponse.response.authenticatorData,
        signature: rawResponse.response.signature,
      };
    } catch (error) {
      console.error("Error authenticating with passkey:", error);
      throw error;
    }
  }
}

export const nativeWebauthnService = new NativeWebAuthnService();
