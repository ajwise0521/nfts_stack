import {PoolConfig as PostgresConfig} from "pg";
import {PoolConfig as MySqlConfig} from "mysql";
import { environment } from "../../environment";
const nftsDbConfig: MySqlConfig = {
    user: environment.nftsDatabase.NFTS_DB_USERNAME || 'undefined_user',
    host: environment.nftsDatabase.NFTS_DB_HOST || 'undefined_host',
    database: environment.nftsDatabase.NFTS_DB_DATABASE || 'undefined_db',
    password: environment.nftsDatabase.NFTS_DB_PASSWORD || 'undefined_pass',
    port: 3306,
    connectionLimit: 25,
    connectTimeout: 30*1000,
    timezone: '00:00'
}

export {
    nftsDbConfig
}
