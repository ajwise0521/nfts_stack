import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { generateResponse } from "../../helpers/cdkHelpers"
import { isVerified } from '../controllers/verificationController'
import MySqlDatabase from "../../db/base/mysqlDatabase"
import { nftsDbConfig } from "../../db/base/dbConfig"
import { getTargetTags } from "../../db/sql/tagQueries"
const nftsDatabaseConnection = new MySqlDatabase('NFTs Database Connection', nftsDbConfig)

export const handle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    try {
    const walletId = event.queryStringParameters?.walletId ?? ''
        const target = event.queryStringParameters?.target ?? ''
        const tagTypeId = Number(event.queryStringParameters?.tagTypeId) ??  -1
        const targetTags = await getTargetTags(nftsDatabaseConnection, target, walletId, tagTypeId)

        return generateResponse({targetTags}, true, 200)
    } catch(error) {
        console.log(`error getting target Tags root: ${error instanceof Error ? error.message : 'unknown error'}`)
        return generateResponse({}, false, 400, error)
    }
}