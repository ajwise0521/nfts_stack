import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayEventDefaultAuthorizerContext } from "aws-lambda"
import { getWalletsNfts, nftsAlternative } from "../../helpers/nftHelpers"
import MySqlDatabase from "../../db/base/mysqlDatabase"
import { nftsDbConfig } from "../../db/base/dbConfig"
import { isString, update } from "lodash"
import { getVerifiedCollections } from '../../db/sql/verificationCollectionsQueries'
import { verifyWallet, WalletVerification } from "../controllers/verificationController"
import { getAllowedResponseHeaders } from "../../helpers/cdkHelpers"
import {getRankSourcesByCollection} from '../../db/sql/rankQueries'

const nftsDatabaseConnection = new MySqlDatabase('NFTs Database Connection', nftsDbConfig)

export const handle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let walletId: string
     walletId = event.pathParameters?.walletId ?? ''
    let updateAuthority = event.queryStringParameters?.updateAuthority ?? ''
    console.log(`wallet: ${walletId}`)
    try {
        const promises = await Promise.all([
            await getWalletsNfts(walletId, nftsDatabaseConnection),
            await getVerifiedCollections(nftsDatabaseConnection),
            await getRankSourcesByCollection(updateAuthority, nftsDatabaseConnection)
        ])
        console.log(JSON.stringify(promises))
        const collections = promises[0]
        const verifiedCollections = promises[1]
        const rankSources = promises[2]
        const walletVerification: WalletVerification = await verifyWallet(collections.collections, verifiedCollections, walletId, nftsDatabaseConnection)
        let nfts: nftsAlternative[] = []
        if(updateAuthority != '') {
            collections.collections.forEach(collection => {
                if(collection.updateAuthority === updateAuthority) {
                    nfts = collection.nfts
                }
            })  
        } else {
            collections.collections.forEach(collection => {
                nfts = nfts.concat(collection.nfts)
            })
        }
        return {
            statusCode: 200,
            headers: getAllowedResponseHeaders(),
            body: JSON.stringify({nfts, count: nfts.length, rankSources, ...{verification: walletVerification}})
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