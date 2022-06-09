import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { isArray } from 'lodash'

export class MagicEden {
    instance: AxiosInstance
    constructor() {
        this.instance = axios.create({
            baseURL: process.env.MAGIC_EDEN_API_URL ?? 'https://api-mainnet.magiceden.dev'
        })
    }

    getCollections = async (offset: number = 0, limit: number = 500): Promise<MagicEdenCollection[]> =>{
        let response: AxiosResponse = await this.instance.get(`v2/collections?offset=${offset}&limit=${limit}`)

        return response.data as MagicEdenCollection[]
    }

    getCollectionStats = async(collection: string): Promise<CollectionStats> => {
        try {
            const response: AxiosResponse = await this.instance.get(`v2/collections/${collection}/stats`)

            return response.data as CollectionStats
        } catch(error) {
            console.log(`error getting collection Stats : ${error instanceof Error ? error.message : 'unknown error'}`)
            return {} as CollectionStats
        }
    }

    getMetadata = async(mintAddress: string): Promise<MagicEdenMetadata> => {
        try {
            const { data } = await this.instance.get(`rpc/getNFTByMintAddress/${mintAddress}`)
            if(data.status == 500) {
                return {} as MagicEdenMetadata
            }
            return data
        } catch(error) {
            console.log(`error fetching medtadata: ${error instanceof Error ? error.message : 'unknown error'}`)
            return {} as MagicEdenMetadata
            throw(error)
        }
    }

    getCollectionListings = async(collectionSymbol: string, count: number): Promise<MagicEdenListing[]> => {
        try {
            const {data} = await this.instance.get(`v2/collections/${collectionSymbol}/listings?offset=0&limit=${count}`)

            return data as MagicEdenListing[]
        } catch(error) {
            console.log(`error getting ME collection listings ${error instanceof Error ? error.message : 'unknown error'}`)
            // throw(error)
            return []
        }
    }

}
export interface MagicEdenCollection {
    symbol: string,
    name: string,
    description: string,
    image: string,
    twitter: string,
    discord: string,
    website: string,
    categories: string[]
}

export interface CollectionStats {
    symbol: string,
    floorPrice: number,
    listedCount: number,
    avgPrice24hr: number,
    volumeAll: number    
}

export interface MagicEdenMetadata {
    results: MagicEdenMetadataResults
}

interface MagicEdenMetadataCreator {
    address: string,
    verified: number,
    share: number
}

interface MagicEdenMetadataAttribute {
    trait_type: string
    value: string
    share?: number
}

interface MagicEdenMetadataFile {
    uri: string,
    type: string
}

interface MagicEdenMetadataProperties {
    files: MagicEdenMetadataFile[]
    category: string,
    creators: MagicEdenMetadataCreator[]
}

export interface MagicEdenMetadataResults {
    id: string
    price: number|string,
    owner: string,
    collectionName: string,
    collectionTitle: string,
    img: string,
    title: string,
    content: string,
    externalURL: string,
    propertyCategory: string,
    creators: MagicEdenMetadataCreator[],
    sellerFeeBasisPoints: number,
    mintAddress: string,
    attributes: MagicEdenMetadataAttribute,
    properties: MagicEdenMetadataProperties
    supply: number,
    updateAuthority: string,
    primarySaleHappened: number,
    onChainCollection: {},
    tokenDelegateValid: boolean
}

export interface MagicEdenListing {
    pdaAddress: string,
    auctionHouse: string,
    tokenAddress: string,
    tokenMint: string,
    seller: string,
    sellerReferral: string,
    tokenSize: number,
    price: number
}