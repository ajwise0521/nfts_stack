import { config } from 'dotenv'
config()
export const environment = {
    nftsDatabase: {
        NFTS_DB_USERNAME: process.env.NFTS_DB_USERNAME ?? 'admin',
        NFTS_DB_HOST: process.env.NFTS_DB_HOST ?? 'nfts-database.cp0nybxjyl8j.us-east-1.rds.amazonaws.com',
        NFTS_DB_DATABASE: process.env.NFTS_DB_DATABASE ?? 'nfts_database',
        NFTS_DB_PASSWORD: process.env.NFTS_DB_PASSWORD ?? 'WQH.HyqfflgFEUZAAi9QG0Zg_J.WU-',
    },
    magicEden: {
        MAGIC_EDEN_API_URL: process.env.MAGIC_EDEN_API_URL ?? 'https://api-mainnet.magiceden.dev'
    },
    howRare: {
        HOW_RARE_IS_API_URL: process.env.HOW_RARE_IS_API_URL ?? 'https://api.howrare.is'
    }
}