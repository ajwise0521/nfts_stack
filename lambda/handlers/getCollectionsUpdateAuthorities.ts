import { getCollectionsWithoutUpdateAuthorities, updateCollectionsUpdateAuthorities } from "../../db/sql/nftCollectionQueries"
import { nftCollectionCount, nftCollection} from "../../db/tables/nftCollections"
import {MagicEden} from '../controllers/magicEden'
import MySqlDatabase from "../../db/base/mysqlDatabase"
import { nftsDbConfig } from "../../db/base/dbConfig"
import { isUndefined, isEmpty } from "lodash"
const ms: number = 3*60*1000
const nftsDatabaseConnection = new MySqlDatabase('NFTs Database Connection', nftsDbConfig)
function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}
export const handle = async () => {
    try {
        let i = 0
        while(i < 6500) {
            let collections = await getCollectionsWithoutUpdateAuthorities(nftsDatabaseConnection, 25)
            const magicEden = new MagicEden()
            for(let item of collections) {
                console.log(item.symbol)
                const listing = await magicEden.getCollectionListings(item.symbol, 1)
                if(!isEmpty(listing) && !isUndefined(listing[0].tokenMint)) {
                    const metadata = await magicEden.getMetadata(listing[0].tokenMint)
                    if(!isEmpty(metadata)) {
                        item.updateAuthority = metadata.results.updateAuthority
                        console.log(JSON.stringify(metadata.results.updateAuthority))
                    }
                } else {
                    item.updateAuthority = 'NULL'
                }
                console.log(i++)
            }
            await updateCollectionsUpdateAuthorities(nftsDatabaseConnection, collections)
            await delay(3*60*1000)
        }
    } catch(error) {
        console.log(`error setting update authority ${error instanceof Error ? error.message : 'uknown error'}`)
    }
}   

handle()