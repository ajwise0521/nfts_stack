import {Pool, PoolConfig, createPool} from "mysql";
import {logger} from "../../middleware";
import SqlStatement from "./SqlStatement";
import QueryResult from "./QueryResult";
import Database from "./Database";

export default class MySqlDatabase extends Database {

    private pool: Pool
    public readonly name: string

    constructor(name: string, config: PoolConfig) {
        super()
        this.name = name
        this.pool = createPool(config)
        this.setup()
    }

    setup(): void {
        // Fired when a new Client is connected.
        this.pool.on('connection', client => {
            client.on('error', (err: Error) => logger.error(`db error: bizarre client error: ${err.message}`, err))
        })

        // Fired when an idle Client emits an error.
        this.pool.on('error', err => logger.error(`db error: idle client error: ${err.message}`, err))

    }

    sqlQuery = async <T>({text, values}: SqlStatement): Promise<QueryResult<T>> => {
        return new Promise<QueryResult<T>>((resolve, reject) => {
            this.pool.getConnection(((err, connection) => {
                if (err) {
                    reject(err)
                    return
                }
                connection.query(
                    {sql: text, values: values},
                    (error, results) => {
                        connection.release()
                        if (error) {
                            resolve({
                                numRows: 0,
                                rows: [],
                                error: true,
                                errorMsg: error.message,
                            })
                            return
                        }
                        resolve({
                            numRows: results.length,
                            rows: results,
                            error: false,
                            errorMsg: null
                        })
                    })
            }))
        })
    }
}