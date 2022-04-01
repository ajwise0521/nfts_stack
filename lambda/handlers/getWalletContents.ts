import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayEventDefaultAuthorizerContext } from "aws-lambda"
import { getWalletsNfts } from "../../helpers/nftHelpers"
import MySqlDatabase from "../../db/base/mysqlDatabase"
import { nftsDbConfig } from "../../db/base/dbConfig"
import { isString } from "lodash"
const nftsDatabaseConnection = new MySqlDatabase('NFTs Database Connection', nftsDbConfig)

export const handle = async (event: APIGatewayProxyEvent|string): Promise<APIGatewayProxyResult> => {
    let walletId: string
    if(isString(event)) {
        walletId = event
    } else {
     walletId = event.pathParameters?.walletId ?? ''
    }
    try {
        const nfts = await getWalletsNfts(walletId, nftsDatabaseConnection)
        console.log(`nfts: ${JSON.stringify(nfts)}`)
        return {
            statusCode: 200,
            body: JSON.stringify(nfts)
        }
    } catch(error) {
        console.log(error instanceof Error ? error.message: 'unknown error')
        return {
            statusCode: 500,
            body: error instanceof Error ? error.message : 'unknown error'
        }
    }
}

handle('HcbnbYctUWHFndNQGpNGnicDpDn2fSt3AscfrM3j7JT8')