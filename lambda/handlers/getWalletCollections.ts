import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayEventDefaultAuthorizerContext } from "aws-lambda"
import { getWalletsNfts, getWalletCollections } from "../../helpers/nftHelpers"
import MySqlDatabase from "../../db/base/mysqlDatabase"
import { nftsDbConfig } from "../../db/base/dbConfig"
import { getVerifiedCollections } from '../../db/sql/verificationCollectionsQueries'
import { verifyWallet, WalletVerification } from "../controllers/verificationController"
import { getAllowedResponseHeaders } from "../../helpers/cdkHelpers"
const nftsDatabaseConnection = new MySqlDatabase('NFTs Database Connection', nftsDbConfig)

export const handle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let walletId: string
     walletId = event.pathParameters?.walletId ?? ''
    console.log(`wallet: ${walletId}`)
    try {
        const promises = await Promise.all([
            await getWalletCollections(walletId, nftsDatabaseConnection),
            await getVerifiedCollections(nftsDatabaseConnection)
        ])
        console.log(JSON.stringify(promises))
        const collections = promises[0]
        const verifiedCollections = promises[1]
        const walletVerification: WalletVerification = await verifyWallet(collections.collections, verifiedCollections, walletId, nftsDatabaseConnection)

        return {
            statusCode: 200,
            headers: getAllowedResponseHeaders(),
            body: JSON.stringify({...collections, ...{verification: walletVerification}})
        }
    } catch(error) {
        console.log(error instanceof Error ? error.message: 'unknown error')
        return {
            statusCode: 500,
            headers: getAllowedResponseHeaders(),
            body: error instanceof Error ? error.message : 'unknown error'
        }
    }
}

// maybe get all collections, get listings for each, grab first listing and get metadata from that to get updateAuthority information
