import { MagicEden, MagicEdenCollection } from "../controllers/magicEden"
import MySqlDatabase from "../../db/base/mysqlDatabase"
import { nftsDbConfig } from "../../db/base/dbConfig"
import { getCollectionCount, upsertMagicEdenCollections } from "../../db/sql/nftCollectionQueries"
import { config } from 'dotenv'
import { isVerified } from '../controllers/verificationController'
import { getAllowedResponseHeaders } from "../../helpers/cdkHelpers"

config({path: '../../.env'})
const nftsDatabaseConnection = new MySqlDatabase('NFTs Database Connection', nftsDbConfig)
const defaultLimit = 500
export const handle = async () => {
    const magicEden = new MagicEden()

    let collectionCount: number = 0 //await getCollectionCount(nftsDatabaseConnection)

    let offset = collectionCount

    let continueFetching = true

    while(continueFetching) {
        console.log(`offset: ${offset}`)
        const collections = await magicEden.getCollections(offset, defaultLimit)

        if(collections.length == 0) {
            continueFetching = false
            continue
        }

        if(!await upsertMagicEdenCollections(collections, nftsDatabaseConnection)) {
            continueFetching = false
        }

        offset = offset + collections.length
    }
    console.log('out of while loop')
}