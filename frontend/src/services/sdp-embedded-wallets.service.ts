import axios, { AxiosInstance } from 'axios'

export enum WalletStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export type CreateWalletRequest = {
  token: string
  public_key: string
  credential_id: string
}

export type CreateWalletResponse = {
  status: WalletStatus
}

export type CheckWalletStatusResponse = {
  status: WalletStatus
  contract_address?: string
  receiver_contact: string
  contact_type: string
}

export type GetContractAddressResponse = {
  status: WalletStatus
  contract_address?: string
}

export type ResendInviteResponse = {
  message: string
}

export type CosignRecoveryResponse = {
  transaction_xdr: string
}

export type SDPEmbeddedWalletsType = {
  createWallet(input: CreateWalletRequest): Promise<CreateWalletResponse>
  checkWalletStatus(token: string): Promise<CheckWalletStatusResponse>
  getContractAddress(id: string): Promise<GetContractAddressResponse>
  resendInvite(email: string): Promise<ResendInviteResponse>
  cosignRecovery(contractAddress: string, xdr: string): Promise<CosignRecoveryResponse>
}

export const CONNECTION_TIMEOUT = 10000

export default class SDPEmbeddedWallets implements SDPEmbeddedWalletsType {
  private sdpConnection: AxiosInstance

  constructor(connection?: AxiosInstance) {
    this.sdpConnection =
      connection ??
      axios.create({
        baseURL: process.env.NEXT_PUBLIC_SDP_EMBEDDED_WALLETS_URL ||
          'https://stellar-disbursement-platform-backend-dev.stellar.org/embedded-wallets',
        timeout: CONNECTION_TIMEOUT,
        headers: {
          Authorization: process.env.NEXT_PUBLIC_SDP_EMBEDDED_WALLETS_API_KEY,
        },
      })
  }

  public async createWallet(input: CreateWalletRequest): Promise<CreateWalletResponse> {
    const createWalletUrl = '/'

    const requestBody = input
    const response = await this.sdpConnection.post(createWalletUrl, requestBody)

    return response.data as CreateWalletResponse
  }

  public async checkWalletStatus(token: string): Promise<CheckWalletStatusResponse> {
    const checkWalletStatusUrl = `/status/${token}`

    const response = await this.sdpConnection.get(checkWalletStatusUrl)

    return response.data as CheckWalletStatusResponse
  }

  public async getContractAddress(id: string): Promise<GetContractAddressResponse> {
    const getContractAddressUrl = `/${id}`

    const response = await this.sdpConnection.get(getContractAddressUrl)

    return response.data as CheckWalletStatusResponse
  }

  public async resendInvite(email: string): Promise<ResendInviteResponse> {
    const resendInviteUrl = '/resend-invite'

    const requestBody = {
      contact_type: 'EMAIL',
      receiver_contact: email,
    }
    const response = await this.sdpConnection.post(resendInviteUrl, requestBody)

    return response.data as ResendInviteResponse
  }

  public async cosignRecovery(contractAddress: string, xdr: string): Promise<CosignRecoveryResponse> {
    const cosignRecoveryUrl = `/cosign-recovery/${contractAddress}`

    const requestBody = {
      transaction_xdr: xdr,
    }
    const response = await this.sdpConnection.post(cosignRecoveryUrl, requestBody)

    return response.data as CosignRecoveryResponse
  }
}

export const sdpEmbeddedWallets = new SDPEmbeddedWallets()