import Database from "../base/database"
import SqlStatement from "../base/sqlStatement"
import { WalletConnection } from "../tables/connections"
import dayjs from 'dayjs'
import {v5 as uuidv5} from 'uuid'
import { Connection } from "typeorm"
const MY_NAMESPACE = '53ef717d-8f8e-4433-81a0-d2ab74ee5430'

export const verifyToken = async (verificationToken: string, connection: Database): Promise<boolean> => {
    try {
        const date = dayjs().toISOString()
        const queryString = `SELECT * FROM connections WHERE token = '${verificationToken}' AND expires_at > '${date}' LIMIT 1`
        const statement = new SqlStatement(queryString, [])
        const results = await connection.sqlQuery<WalletConnection>(statement, true)
        console.log(`results ${JSON.stringify(results)}`)
        if(results.rows.length > 0) {
            updateVerificationToken(results.rows[0], connection)
            return true
            
        }
        return false
    } catch(error) {
        throw(error)
    }

}

export const updateVerificationToken = async (walletConnection: WalletConnection, connection: Database) => {
    try {
        const date = dayjs().add(2, 'hours').toISOString()
        const queryString = `UPDATE connections SET set expires_at='${date}', api_calls=${walletConnection.api_calls + 1} WHERE token = '${walletConnection.token}`
        const statement = new SqlStatement(queryString, [])
        const results = await connection.sqlQuery(statement, true)
    } catch(error) {
        throw(error)
    }
}

export const createWalletConnection = async (walletAddress: string, connection: Database): Promise<string> => {
    try {
        const date = dayjs().add(5, 'hours').toISOString()
        const token = uuidv5(dayjs().unix().toString() + walletAddress, MY_NAMESPACE)
        const queryString = `INSERT INTO connections (wallet_address, expires_at, api_calls, verification_type, token) VALUES('${walletAddress}', '${date}', 0, 1, '${token}')`
        const statement = new SqlStatement(queryString, [])
        const response = await connection.sqlQuery(statement, true)
        console.log(JSON.stringify(queryString))
        return token
    } catch(error) {
        throw(error)
    }
}   

export const isVerifiedWallet = async (walletAddress: string, connection: Database): Promise<boolean> => {
    try {
        const date = dayjs().toISOString()
        const queryString = `SELECT * FROM verification_addresses WHERE wallet_address = '${walletAddress}' AND expiration_date > '${date}'`
        const statement = new SqlStatement(queryString, [])
        const results = await connection.sqlQuery<WalletConnection>(statement, true)
        if(!results.error && results.rows.length > 0) {
            return true
        }
        return false
    } catch(error) {
        console.log(`Error checking if verified wallet: ${error instanceof Error ? error.message : 'unknown error'}`)
        return false
    }
}