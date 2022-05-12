import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { generateResponse } from "../../helpers/cdkHelpers"
import { isVerified } from '../controllers/verificationController'
import MySqlDatabase from "../../db/base/mysqlDatabase"
import { nftsDbConfig } from "../../db/base/dbConfig"
import { getAllCollections } from "../../db/sql/nftCollectionQueries"
const nftsDatabaseConnection = new MySqlDatabase('NFTs Database Connection', nftsDbConfig)

export const handle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const collections = await getAllCollections(nftsDatabaseConnection)
        return generateResponse({collections}, true, 200)
    } catch(error) {
        return generateResponse({}, false, 401, `Error getting Collections: ${error instanceof Error ? error.message : 'unknown error'}`)
    }
}