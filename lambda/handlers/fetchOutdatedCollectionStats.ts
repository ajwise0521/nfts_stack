import { getOutdatedCollectionStats } from "../../db/sql/collectionStatsQueries"
import MySqlDatabase from "../../db/base/mysqlDatabase"
import { nftsDbConfig } from "../../db/base/dbConfig"
import { MagicEden } from "../controllers/magicEden"
import { insertCollectionStats } from "../../db/sql/collectionStatsQueries"
import { isNull } from "lodash"
export const delay = (ms: number)  => {
    return new Promise( resolve => setTimeout(resolve, ms) );
}
const nftsDatabaseConnection = new MySqlDatabase('NFTs Database Connection', nftsDbConfig)
export const handle = async () => {
    try {
        let outdatedStats = await getOutdatedCollectionStats(nftsDatabaseConnection)
        const magicEden = new MagicEden()
        while(outdatedStats.length > 0) {
            console.log(`length: ${outdatedStats.length}`)
            for(let i = 0; i < outdatedStats.length; i++) {
                if(isNull(outdatedStats[i].symbol)) {
                    continue;
                }
                console.log(`fetching: ${outdatedStats[i].symbol}`)
                const stats = await magicEden.getCollectionStats(outdatedStats[i].symbol)
                await insertCollectionStats(nftsDatabaseConnection, stats)
            }
            await delay(30000)
            outdatedStats = await getOutdatedCollectionStats(nftsDatabaseConnection)
        }
        console.log('all collections updated')
        return
    } catch(error) {
        console.log(`error fetching Outdated Stats: ${error instanceof Error ? error.message : 'unknown error'}`)
        return
    }
}