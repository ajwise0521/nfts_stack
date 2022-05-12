import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { MagicEden } from '../controllers/magicEden'
import MySqlDatabase from "../../db/base/mysqlDatabase"
import { nftsDbConfig } from "../../db/base/dbConfig"
import { isVerified } from '../controllers/verificationController'
import { getAllowedResponseHeaders } from "../../helpers/cdkHelpers"
const nftsDatabaseConnection = new MySqlDatabase('NFTs Database Connection', nftsDbConfig)

export const handle = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const magicEdenInstance = new MagicEden()
    const collectionName = event.pathParameters?.collectionName ?? null
    try {
        if(!collectionName) {
            return {
                body: 'collection not found',
                statusCode: 200,
                headers: getAllowedResponseHeaders(),
            }
        }
        const stats = await magicEdenInstance.getCollectionStats(collectionName)
        return {
            body: JSON.stringify(stats),
            statusCode: 200,
            headers: getAllowedResponseHeaders(),
        }
    } catch(error) {
        return {
            body: error instanceof Error ? error.message : 'unknown error',
            statusCode: 400,
            headers: getAllowedResponseHeaders(),
        }
    }
}