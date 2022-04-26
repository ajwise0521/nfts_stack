import { BooleanArray } from 'aws-sdk/clients/rdsdataservice'
import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { toUpper } from 'lodash'


export class MoonRank {
    instance: AxiosInstance
    constructor() {
        this.instance = axios.create({
            baseURL: process.env.MOON_RANK_API_URL ?? ''
        })
    }

    getCollectionRanks = async(collectionName: string): Promise<MoonRankResponse> => {
        try {
            let response = await this.instance.get(`mints/${collectionName}`)
            return response.data as MoonRankResponse
        } catch(error) {
            console.log(`error getting ranks: ${error instanceof Error ? error.message : 'unknown error'}`)
            return {} as MoonRankResponse
        }
    }

}

export interface MoonRankResponse {
    partial: boolean
    collection: MoonRankCollection
    crawl: MoonRankCrawl
    mints: MoonRankMint[]
}

export interface MoonRankCollection {
    id: string
    image: string
    name: string
    description: string,
    verified_collection_address: string | null
    pieces: number,
    provenance: MoonRankProvenance[]
    sealed: boolean
    verified: boolean
    tags: string|null
    metadata: MoonRankMetadata,
}

export interface MoonRankProvenance {
    address: string,
    type: string
}

export interface MoonRankMetadata {
    private: boolean
    shadow: boolean
    access_key: string
    go_live_at: string
    api_block: boolean
}

export interface MoonRankCrawl {
    id: string
    first_mint_ts: number
    last_mint_ts: number
    first_mint: string
    last_mint: string
    until_tx: string
    until_slot: number
    expected_pieces: number
    seen_pieces: number
    last_crawl_id: number
    complete: boolean
    blocked: boolean
    ubblock_at_ts: number
}

export interface MoonRankMint {
    crawl_id: number
    mint: string
    name: string
    image: string,
    created: number
    rank: number
    rarity: number
    rank_explained: []
}