import {readConfig, writeConfig} from './base/dbConfig'
import PostgresDatabase from './base/postgresDatabase'

const readDb = new PostgresDatabase(readConfig)
const writeDb = new PostgresDatabase(writeConfig)

export {
    readDb as db,
    writeDb as readWriteDb
}
