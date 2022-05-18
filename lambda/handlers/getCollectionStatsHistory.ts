import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { CollectionStats } from '../controllers/magicEden'
import MySqlDatabase from "../../db/base/mysqlDatabase"
import { nftsDbConfig } from "../../db/base/dbConfig"
import { getCollectionStatsHistory } from "../../db/sql/collectionStatsQueries"
import { generateResponse, getAllowedResponseHeaders } from "../../helpers/cdkHelpers"
const nftsDatabaseConnection = new MySqlDatabase('NFTs Database Connection', nftsDbConfig)

export const handle = async(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const collectionId = Number(event.pathParameters?.collectionId)

    if(isNaN(collectionId)) {
        return generateResponse({}, false, 401, Error('Bad Format of collection ID'))
    }
    try {
        const results = await getCollectionStatsHistory(nftsDatabaseConnection, collectionId)
        
        return generateResponse({results}, true, 200)
    } catch(error) {
        return generateResponse({}, false, 401, error)
    }
}