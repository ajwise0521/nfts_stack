import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import MySqlDatabase from "../../db/base/mysqlDatabase"
import { nftsDbConfig } from "../../db/base/dbConfig"
import { getWalletCollections } from "../../helpers/nftHelpers"
import { generateResponse } from "../../helpers/cdkHelpers"
const nftsDatabaseConnection = new MySqlDatabase('NFTs Database Connection', nftsDbConfig)

export const handle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const walletId: string = event.pathParameters?.walletId ?? ''
    console.log(walletId)
    try {
        const collections = await getWalletCollections(walletId, nftsDatabaseConnection)
        return generateResponse(collections, true, 200)
    } catch(error) {
        return generateResponse({}, false, 500, error)
    }
}

// maybe get all collections, get listings for each, grab first listing and get metadata from that to get updateAuthority information
