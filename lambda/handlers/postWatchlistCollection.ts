import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { nftsDbConfig } from "../../db/base/dbConfig"
import { generateResponse } from "../../helpers/cdkHelpers"
import MySqlDatabase from "../../db/base/mysqlDatabase"
import { insertWatchListCollection } from "../../db/sql/watchListCollectionQueries"
const nftsDatabaseConnection = new MySqlDatabase('NFTs Database Connection', nftsDbConfig)

export const handle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const data = JSON.parse(event.body ?? '')
    const {walletAddress} = data

    try {
        const collectionId = Number(data.collectionId)
        if(!collectionId) {
            throw(Error(`collectionId not a number ${data.collectionId}`))
        }
        const message = await insertWatchListCollection(walletAddress, collectionId, nftsDatabaseConnection)
        return generateResponse({message}, true, 200)
    } catch(error) {
        return generateResponse({}, false, 401, error)
    }
}