import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { getWalletCollections } from "../../helpers/nftHelpers"
import MySqlDatabase from "../../db/base/mysqlDatabase"
import { nftsDbConfig } from "../../db/base/dbConfig"


export const handle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('one')
    const nftsDatabaseConnection = new MySqlDatabase('NFTs Database Connection', nftsDbConfig)
    
    console.log('two')
    const walletId: string = event.pathParameters?.walletId ?? ''
    try {
        const collections = await getWalletCollections(walletId, nftsDatabaseConnection)

        return {
            statusCode: 200,
            body: JSON.stringify(collections)
        }
    } catch(error) {
        return {
            statusCode: 400,
            body: error instanceof Error ? error.message : ''
        }
    }
}

// maybe get all collections, get listings for each, grab first listing and get metadata from that to get updateAuthority information
