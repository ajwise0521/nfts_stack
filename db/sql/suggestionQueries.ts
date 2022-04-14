import { query } from "winston"
import Database from "../base/database"
import SqlStatement from "../base/sqlStatement"

export const createSuggestion = async(connection: Database, description: string):Promise<boolean> => {
    try {
        const queryString = `INSERT INTO suggestions (description, created_at) VALUES('${description}', NOW())`
        const statement = new SqlStatement(queryString, [])
        const results = await connection.sqlQuery(statement, true)
        return !results.error
    } catch(error) {
        console.log(`error intering new suggestion: ${error instanceof Error ? error.message : 'unknown error'}`)
        return false
    }

}