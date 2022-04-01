import axios, { AxiosInstance, AxiosResponse } from 'axios'

export class MagicEden {
    instance: AxiosInstance
    constructor() {
        this.instance = axios.create({
            baseURL: process.env.MAGIC_EDEN_API_URL ?? 'https://api-mainnet.magiceden.dev'
        })
    }

    getCollections = async (offset: number = 0, limit: number = 500): Promise<MagicEdenCollection[]> =>{
        let response: MagicEdenResponse = await this.instance.get(`v2/collections?offset=${offset}&limit=${limit}`)

        return response.data as MagicEdenCollection[]
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

interface MagicEdenResponse {
    data: MagicEdenCollection[]
}