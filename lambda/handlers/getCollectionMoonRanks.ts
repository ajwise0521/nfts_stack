 import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { MoonRank, MoonRankMint, MoonRankResponse } from '../controllers/moonRank'
import { isVerified } from '../controllers/verificationController'
import MySqlDatabase from "../../db/base/mysqlDatabase"
import { nftsDbConfig } from "../../db/base/dbConfig"
import { getAllowedResponseHeaders } from "../../helpers/cdkHelpers"
import { generateResponse } from "../../helpers/cdkHelpers"
const nftsDatabaseConnection = new MySqlDatabase('NFTs Database Connection', nftsDbConfig)

export const handle = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const verified = await isVerified(event.headers['wallet-verification-token'] ?? '1', nftsDatabaseConnection)
        if(!verified) {
            return {
                body: 'Wallet Not Verified',
                statusCode: 401,
                headers: getAllowedResponseHeaders(),
            }
        }
        const collectionName = event.pathParameters?.collectionName ?? null
        if(!collectionName) {
            throw(Error('Name not found'))
        }
        const moonRank = new MoonRank()
        const data: MoonRankResponse = await moonRank.getCollectionRanks(collectionName)
        const collectionData = data.mints.reduce(
            (entryMap, e: MoonRankMint) => entryMap.set(e.mint, {rank: e.rank}),
            new Map()
        )
        return generateResponse({source: 'moonRank', ranks: Object.fromEntries(collectionData)}, true, 200)
    } catch(error) {
        console.log(`Failed to get ranks : ${error instanceof Error ? error.message : 'unknown error'}`)
        return generateResponse({}, false, 400, 'error getting ranks')
    }
}