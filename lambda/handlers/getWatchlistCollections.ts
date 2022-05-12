import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { nftsDbConfig } from "../../db/base/dbConfig"
import { generateResponse } from "../../helpers/cdkHelpers"
import MySqlDatabase from "../../db/base/mysqlDatabase"
import { getWatchListCollections } from "../../db/sql/nftCollectionQueries"
const nftsDatabaseConnection = new MySqlDatabase('NFTs Database Connection', nftsDbConfig)

export const handle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const walletAddress = event.pathParameters?.walletAddress ?? ''
        const collections = await getWatchListCollections(nftsDatabaseConnection, walletAddress)

        return generateResponse({collections}, true, 200)
    } catch(error) {
        console.log(`Error in getWatchlistCollections : ${error instanceof Error ? error.message : 'unknown error'}`)
        return generateResponse({}, false, 401, error)
    }
}