import Database from "../base/database";
import { VerificationCollection } from "../tables/verificationCollection";
import SqlStatement from "../base/sqlStatement"
import dayjs from 'dayjs'

export const getVerifiedCollections = async (connection: Database): Promise<VerificationCollection[]> => {
    try {
        console.log('getting verified collections')
        const date = dayjs().toISOString()
        const queryString = `SELECT * FROM verification_collections WHERE expiration_date > '${date}'`
        const statement = new SqlStatement(queryString, [])
        const verifiedCollections = await connection.sqlQuery<VerificationCollection>(statement, true)
        console.log(`verified collections :${JSON.stringify(verifiedCollections)}`)
        return verifiedCollections.rows
    } catch(error) {
        console.log(`error getting verified collections ${error instanceof Error ? error.message : 'unknown error'}`)
        throw(error)
    }
}