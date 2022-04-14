import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import MySqlDatabase from "../../db/base/mysqlDatabase"
import { nftsDbConfig } from "../../db/base/dbConfig"


export const handle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('one')
    const nftsDatabaseConnection = new MySqlDatabase('NFTs Database Connection', nftsDbConfig)
    
    console.log('two')
    const walletId: string = event.pathParameters?.walletId ?? ''
    try {

        return {
            statusCode: 200,
            body: JSON.stringify({})
        }
    } catch(error) {
        return {
            statusCode: 400,
            body: error instanceof Error ? error.message : ''
        }
    }
}

// maybe get all collections, get listings for each, grab first listing and get metadata from that to get updateAuthority information
