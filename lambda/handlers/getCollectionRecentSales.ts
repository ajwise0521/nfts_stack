import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { getCollectionRecentSales } from "../../helpers/nftHelpers"
import { MagicEdenMetadataResults } from "../controllers/magicEden"
import { isVerified } from '../controllers/verificationController'
import MySqlDatabase from "../../db/base/mysqlDatabase"
import { nftsDbConfig } from "../../db/base/dbConfig"
import { getAllowedResponseHeaders } from "../../helpers/cdkHelpers"

const nftsDatabaseConnection = new MySqlDatabase('NFTs Database Connection', nftsDbConfig)
export const handle = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const royaltyAddress = event.pathParameters?.royaltyAddress ?? null
    const verified = await isVerified(event.headers['wallet-verification-token'] ?? '1', nftsDatabaseConnection)
    if(!verified || !royaltyAddress) {
        return {
            body: JSON.stringify({
                success: false,
                results: {},
                error: 'Wallet Not Verified'
            }),
            statusCode: 401,
            headers: getAllowedResponseHeaders(),
        }
    }
    try {
        const sales: MagicEdenMetadataResults[] = await getCollectionRecentSales(royaltyAddress)

        return {
            body: JSON.stringify({
                success: true,
                results: sales,
            }),
            statusCode: 200,
            headers: getAllowedResponseHeaders()
        }
    } catch(error) {
        console.log('Error getting recent sales')
        return {
            body: JSON.stringify({
                success: false,
                results: {},
                error: 'Wallet Not Verified'
            }),
            statusCode: 200,
            headers: getAllowedResponseHeaders()
        }
    }
}