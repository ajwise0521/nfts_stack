import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { generateResponse } from "../../helpers/cdkHelpers"
import { isVerified } from '../controllers/verificationController'
import MySqlDatabase from "../../db/base/mysqlDatabase"
import { nftsDbConfig } from "../../db/base/dbConfig"
import { getAvailableTags } from "../../db/sql/tagQueries"
const nftsDatabaseConnection = new MySqlDatabase('NFTs Database Connection', nftsDbConfig)
export const handle = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const tags = await getAvailableTags(nftsDatabaseConnection)
        return generateResponse({tags: tags}, true, 200)
    } catch (error) {
        return generateResponse({}, false, 400, error)
    }
}