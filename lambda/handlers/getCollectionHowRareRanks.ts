import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { HowRare, HowRareResponse, HowRareCollectionItems } from "../controllers/howRare"
import { isVerified } from '../controllers/verificationController'
import MySqlDatabase from "../../db/base/mysqlDatabase"
import { nftsDbConfig } from "../../db/base/dbConfig"
import { getAllowedResponseHeaders } from "../../helpers/cdkHelpers"
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
        const howRare = new HowRare()
        const data: HowRareResponse = await howRare.getCollectionRank(collectionName)
        const collectionData = data.result.data.items.reduce(
            (entryMap, e: HowRareCollectionItems) => entryMap.set(e.id, {rank: e.rank}),
            new Map()
        )
        return {
            body: JSON.stringify(Object.fromEntries(collectionData)),
            statusCode: 200,
            headers: getAllowedResponseHeaders(),
        }
    } catch(error) {
        console.log(`Failed to get ranks : ${error instanceof Error ? error.message : 'unknown error'}`)
        return {
            body: JSON.stringify({}),
            statusCode: 400,
            headers: getAllowedResponseHeaders(),
        }
    }
}