import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { getVerifiedCollectionsCollections } from '../../db/sql/nftCollectionQueries'
import MySqlDatabase from "../../db/base/mysqlDatabase"
import { nftsDbConfig } from "../../db/base/dbConfig"
const nftsDatabaseConnection = new MySqlDatabase('NFTs Database Connection', nftsDbConfig)
import { getAllowedResponseHeaders } from "../../helpers/cdkHelpers"

export const handle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const verifiedCollections = await getVerifiedCollectionsCollections(nftsDatabaseConnection)

        return {
            body: JSON.stringify({
                success: true,
                results: verifiedCollections,
            }), 
            statusCode: 200,
            headers: getAllowedResponseHeaders(),
        }
    } catch(error) {
        return {
            body: JSON.stringify({
                status: false,
                error: (error instanceof Error ? error.message : 'unknown error')
            }),
            statusCode: 401,
            headers: getAllowedResponseHeaders(),
        }
    }
} 