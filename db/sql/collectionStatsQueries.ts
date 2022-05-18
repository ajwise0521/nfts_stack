import Database from "../base/database"
import SqlStatement from "../base/sqlStatement"
import { nftCollectionCount, nftCollection, nftCollectionWithVerificationCount} from "../tables/nftCollections"
import { CollectionStats } from "../../lambda/controllers/magicEden"
import { isUndefined } from "lodash"
import { stat } from "fs"
export const insertCollectionStats = async (connection: Database, stats: CollectionStats): Promise<string> => {
    const queryString = `INSERT INTO collection_stats 
    (collection_id, symbol, floorPrice, listedCount, avgPrice24hr, volumeAll, created_at) 
    VALUES ((SELECT id FROM nft_collections WHERE symbol='${stats.symbol}' LIMIT 1), '${stats.symbol}', ${!isUndefined(stats.floorPrice) ? stats.floorPrice : 0}, ${!isUndefined(stats.listedCount) ? stats.listedCount : 0}, ${!isUndefined(stats.avgPrice24hr) ? stats.avgPrice24hr : `NULL`}, ${!isUndefined(stats.volumeAll) ? stats.volumeAll : 0  }, NOW())`
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
    const queryString = `select nft_collections.*, collection_stats.created_at as last_update from nft_collections LEFT JOIN collection_stats ON nft_collections.id = collection_stats.collection_id where collection_stats.created_at <= now() - INTERVAL 1 DAY OR collection_stats.created_at IS NULL group by symbol ORDER by last_update LIMIT 10`
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