import Database from "../base/database"
import SqlStatement from "../base/sqlStatement"
import { nftCollectionCount, nftCollection, nftCollectionWithVerificationCount} from "../tables/nftCollections"
import { CollectionStats } from "../../lambda/controllers/magicEden"
import { isUndefined } from "lodash"
import { stat } from "fs"
export const insertCollectionStats = async (connection: Database, stats: CollectionStats): Promise<string> => {

    const queryString = `INSERT INTO collection_stats 
    (collection_id, symbol, floorPrice, listedCount, avgPrice24hr, volumeAll, created_at)
    SELECT (SELECT id FROM nft_collections WHERE symbol='' LIMIT 1), '${stats.symbol}', ${!isUndefined(stats.floorPrice) ? stats.floorPrice : 0}, ${!isUndefined(stats.listedCount) ? stats.listedCount : 0}, ${!isUndefined(stats.avgPrice24hr) ? stats.avgPrice24hr : `NULL`}, ${!isUndefined(stats.volumeAll) ? stats.volumeAll : 0  }, NOW() where (select count(symbol) from collection_stats where symbol='${stats.symbol}' AND created_at > NOW() - INTERVAL 1 HOUR) < 1`

    console.log(queryString)
    try {
        const statement = new SqlStatement(queryString, [])
        const results = await connection.sqlQuery(statement, true)
        console.log(JSON.stringify(results))
        if(!results.error) {
            return 'Collection Stat entered'
        }
        return 'failed to enter Collection Stat'
    } catch(error) {
        throw(Error(`Error enteriing Collection Stat: ${error instanceof Error ? error.message : 'unknown error'}`))
    }
}

export const getCollectionStatsHistory = async (connection: Database, collectionId: number): Promise<CollectionStats[]> => {
    const queryString = `SELECT * FROM collection_stats WHERE collection_id = ${collectionId} GROUP BY day( created_at ), hour( created_at )  ORDER BY id desc LIMIT 100`
    
    try {
        const statement = new SqlStatement(queryString, [])
        const results = await  connection.sqlQuery<CollectionStats>(statement, true)

        if(!results.error) {
            return results.rows
        }
        return []
    } catch(error) {
        throw(Error(`Error getting Collection Stats History: ${error instanceof Error ? error.message : 'unknown error'}`))
    }
}

export const getOutdatedCollectionStats = async (connection: Database): Promise<nftCollection[]> => {
    const queryString = `SELECT nft_collections.*, c.* FROM nft_collections 
        LEFT JOIN ( SELECT MAX(created_at) AS last_update, collection_id
        FROM collection_stats group by collection_stats.collection_id) c 
        ON nft_collections.id=c.collection_id where last_update <= now() - INTERVAL 1 DAY 
        OR last_update IS NULL AND nft_collections.symbol IS NOT NULL order by c.last_update asc`
    try {
        const statement = new SqlStatement(queryString, [])
        const results = await connection.sqlQuery<nftCollection>(statement, true)
        if(!results.error)  {
            return results.rows
        }
        return []
    } catch(error) {
        throw(error)
    }
}