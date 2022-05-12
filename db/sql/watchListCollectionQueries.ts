import { query } from "winston"
import { MagicEdenCollection } from "../../lambda/controllers/magicEden"
import Database from "../base/database"
import SqlStatement from "../base/sqlStatement"
import { nftCollectionCount, nftCollection, nftCollectionWithVerificationCount} from "../tables/nftCollections"

export const insertWatchListCollection = async(walletAddress: string, collectionId: number, connection: Database): Promise<string> => {
    const queryString = `INSERT INTO watchlist_collections (walletAddress, collectionId) VALUES ('${walletAddress}', ${collectionId})`
    const checkQueryString = `SELECT * FROM watchlist_collections WHERE walletAddress='${walletAddress}' AND collectionId=${collectionId}`
    try {
        const checkStatement = new SqlStatement(checkQueryString, [])
        const checkResults = await connection.sqlQuery(checkStatement, true)
        if(checkResults.rows.length > 0) {
            return 'Collection Already on Watchlist'
        }
        const statement = new SqlStatement(queryString, [])
        const results = await connection.sqlQuery(statement, true)
        if(!results.error) {
            return 'Collection Added'
        }
        return 'Failed to Add Collection'
    } catch(error) {
        console.log(`error inserting watchlist collection ${error instanceof Error ? error.message : 'unknown error'}`)
        throw(Error(error instanceof Error ? error.message : 'unknown error'))
    }
}

export const deleteWatchlistCollection = async(walletAddress: string, collectionId: number, connection: Database): Promise<string> => {
    const queryString = `DELETE FROM watchlist_collections WHERE walletAddress='${walletAddress}' AND collectionId=${collectionId}`

    try {
        const statement = new SqlStatement(queryString, [])
        const results = await connection.sqlQuery(statement, true)
        console.log(`delete results: ${JSON.stringify(results)}`)
        if(!results.error) {
            return 'Collection Deleted From Watchlist'
        }
        return 'Error Deleting Collection from Watchlist'
    } catch(error) {
        throw(Error(error instanceof Error ? error.message : 'unknown error'))
    }
}