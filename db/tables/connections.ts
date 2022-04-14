export interface WalletConnection {
    id: number,
    token: string,
    wallet_address: string,
    api_calls: number
    expires_at: number
    verification_type: number
}