
import { TagDescriptions, Tags } from "../tables/tags"
import Database from "../base/database"
import SqlStatement from "../base/sqlStatement"
import * as RankInterfaces from '../tables/ranksTables'
export const getRankSourcesByCollection = async(updateAuthority: string, connection: Database): Promise<RankInterfaces.CollectionRanksAlt[]> => {
    const queryString = `SELECT collection_rank_sources.*, rank_sources.* 
        FROM collection_rank_sources JOIN rank_sources ON collection_rank_sources.rank_source_id = rank_sources.id
        WHERE collection_id = (SELECT id FROM nft_collections where updateAuthority='${updateAuthority}' LIMIT 1)`

    try {
        const statement = new SqlStatement(queryString, [])
        const results = await connection.sqlQuery<RankInterfaces.CollectionRanksAlt>(statement, true)

        if(!results.error && results.rows.length > 0) {
            return results.rows
        }
        return []
    } catch(error) {
        console.log(`error getting rank sources: ${error instanceof Error ? error.message : 'unknown error'}`)
        return []
    }
}