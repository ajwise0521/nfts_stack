export interface nftCollection {
    id: number
    symbol: string,
    name: string,
    description: string,
    image: string,
    twitter: string,
    discord: string,
    website: string,
    updateAuthority: string,
    count?: number
}

export interface nftCollectionCount {
    nft_count: number
}

export interface nftCollectionWithVerificationCount {
    id: number
    symbol: string,
    name: string,
    description: string,
    image: string,
    twitter: string,
    discord: string,
    website: string,
    updateAuthority: string,
    required_count: number
}

