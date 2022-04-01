import axios, { AxiosInstance, AxiosResponse } from 'axios'

export class HowRare {
    instance: AxiosInstance
    constructor() {
        this.instance = axios.create({
            baseURL: process.env.HOW_RARE_IS_API_URL ?? ''
        })
    }

    getCollectionRank = async (collectionName: string): Promise<HowRareResponse> =>{
        let response = await this.instance.get(`v0.1/collections/${collectionName}`)

        return response.data as HowRareResponse
    }
}

export interface HowRareResponse {
    api_version: string,
    result: {
        api_code: number,
        api_response: string,
        data: {
            collection: string,
            ranking_url: string,
            twitter: string,
            discord: string,
            website: string,
            description: string,
            logo: string,
            items: HowRareCollectionItems[]
        }
    }
}

export interface HowRareCollectionItems {
    id: string,
    link: string,
    mint: string,
    name: string,
    description: string,
    image: string,
    attributes: HowRareAttribute[]
    rank: number,
    rank_algo: string,
    all_ranks: {
        "howrare.is": number,
        "trait_normalized": number,
        "statistical_rarity": number
    }
}

export interface HowRareAttribute {
    name: string,
    value: number,
    rarity: number
}