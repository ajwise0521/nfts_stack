import { TagDescriptions, Tags } from "../tables/tags"
import Database from "../base/database"
import SqlStatement from "../base/sqlStatement"
import { nftCollectionCount, nftCollection, nftCollectionWithVerificationCount} from "../tables/nftCollections"

export const getAvailableTags = async (connection: Database): Promise<TagDescriptions[]> => {
    try {

        const queryString = 'SELECT * FROM tag_descriptions'
        const statement = new SqlStatement(queryString, [])
        const result = await connection.sqlQuery<TagDescriptions>(statement, true)

        if(!result.error && result.rows.length > 0) {
            return result.rows
        }
        return []
    } catch(error) {
        console.log(`error getting available tags: ${error instanceof Error ? error.message : 'unknown error'}`)
        return []
    }
}

export const getTargetTags = async (connection: Database, target: string, walletId: string, typeId: number): Promise<Tags[]> => {
    try {
        const queryString = `
            SELECT * FROM tags WHERE wallet_id='${walletId}' 
            AND value='${target}' 
            AND tag_type_id=${typeId}`
            const statement = new SqlStatement(queryString, [])
            const result = await connection.sqlQuery<Tags>(statement, true)
            if(!result.error && result.rows.length > 0) {
                return result.rows
            }
            return []
    } catch(error) {
        console.log(`error getting targetTags: ${error instanceof Error ? error.message : 'unknown error'}`)
        return []
    }
}
