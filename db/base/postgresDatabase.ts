import {logger} from "../../middleware";
import {Pool, PoolClient, PoolConfig} from "pg";
import SqlStatement from "./sqlStatement";
import QueryResult from "./queryResult";
import Database from "./database";

export default class PostgresDatabase extends Database {

    private pool: Pool

    constructor(config: PoolConfig) {
        super()
        this.pool = new Pool(config)
        this.setup()
    }

    setup(): void {
        // Fired when a new Client is connected.
        this.pool.on('connect', client => {
            client.on('error', err => logger.error(`DB client connect error: ${err.message}`, err))
        })

        // Fired when an idle Client emits an error.
        this.pool.on('error', err => logger.error(`db client error: ${err.message}`, err))
    }

    transQuery = async (queries: SqlStatement[]): Promise<QueryResult<unknown>[]> => {
        const client = await this.pool.connect()
        try {
            await client.query('BEGIN')
            return Promise.all(queries.map(statement =>
                client.query(statement.text, statement.values)
            )).then(result => {
                client.query('COMMIT').then()

                return result.map(row => {
                    return {
                        numRows: row.rowCount,
                        rows: row.rows,
                        error: false,
                        errorMsg: null,
                    }
                })
            }).catch(errors => {
                client.query('ROLLBACK').then()
                return [{
                    numRows: 0,
                    rows: [],
                    error: true,
                    errorMsg: errors.message,
                }]
            })
        } catch (error) {
            return [{
                numRows: 0,
                rows: [],
                error: true,
                errorMsg: (error instanceof Error) ? error.message : 'unknown error',
            }]
        } finally {
            client.release()
        }
    }

    blockQuery = async <T>(transaction: (client: PoolClient) => Promise<T>): Promise<T> => {
        const client = await this.pool.connect()
        try {
            await client.query('BEGIN')
            const results = await transaction(client)
            client.query('COMMIT').then()
            return results
        } catch (error) {
            client.query('ROLLBACK').then()
            throw error
        } finally {
            client.release()
        }
    }

    execute = async <T>(client: PoolClient, {text, values}: SqlStatement): Promise<QueryResult<T>> => {
        const result = await client.query(text, values)
        return {
            numRows: result.rowCount,
            rows: result.rows,
            error: false,
            errorMsg: null,
        }
    }

    sqlQuery = async <T>({text, values}: SqlStatement, throws = false): Promise<QueryResult<T>> => {
        const client = await this.pool.connect()

        try {
            const result = await client.query(text, values)
            return {
                numRows: result.rowCount,
                rows: result.rows,
                error: false,
                errorMsg: null,
            }
        } catch (error) {
            if (throws) {
                throw error
            }

            return {
                numRows: 0,
                rows: [],
                error: true,
                errorMsg: (error instanceof Error) ? error.message : 'unknown error',
            }
        } finally {
            client.release()
        }
    }
}
