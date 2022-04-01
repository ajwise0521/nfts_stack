import { Connection } from "typeorm"
import { MagicEdenCollection } from "../../lambda/controllers/magicEden"
import Database from "../base/database"
import SqlStatement from "../base/sqlStatement"
import { nftCollectionCount, nftCollection} from "../tables/nftCollections"
const nftUpdateInsertQuery = 'INSERT INTO nft_collections (symbol, name, image, twitter, discord, website) VALUES'
const onDuplicateKeyString = ' ON DUPLICATE KEY UPDATE symbol=VALUES(symbol), name=VALUES(name), image=VALUES(image), twitter=VALUES(twitter), discord=VALUES(discord), website=VALUES(website) '

export const upsertMagicEdenCollections = async <T>(collections: MagicEdenCollection[], connection: Database) => {
    console.log('compiling query')
    if(collections.length < 1) {
        return
    }
    let queryString: string = ''
    try {
        queryString = collections.reduce((acc: string, el: MagicEdenCollection, i) => {
            acc = i < collections.length  - 1? 
                acc + ` ("${el.symbol}", "${el.name.replace(/"/g, '')}", "${el.image}", "${el.twitter}", "${el.discord}", "${el.website}"),` : 
                acc + ` ("${el.symbol}", "${el.name.replace(/"/g, '')}", "${el.image}", "${el.twitter}", "${el.discord}", "${el.website}")`
            return acc
        }, nftUpdateInsertQuery)

        if(queryString == nftUpdateInsertQuery) {
            return ''
        }
        if(queryString[queryString.length - 1] === ' ') {
            queryString = queryString.slice(0, queryString.length - 2)
        }
        queryString += onDuplicateKeyString;
        console.log(queryString)
    } catch (error) {
        console.log(`error creating query string: ${error instanceof Error ? error.message : error}`)
        return false
    }

    try {
        const statement = new SqlStatement(queryString, [])
        const result = await connection.sqlQuery<T>(statement, true)
        console.log(`queryResult: ${JSON.stringify(result)}`)
    } catch(error) {
        console.log(`error inserting collections: ${error instanceof Error ? error.message : error}`)
        return false
    }
    return true
}

export const getCollectionCount = async (connection: Database): Promise<number> => {
    const queryString: string = 'SELECT COUNT(*) as nft_count from nft_collections'
    const statement = new SqlStatement(queryString, [])
    const results = await connection.sqlQuery<nftCollectionCount>(statement, true)
    return results?.rows?.length > 0 ? results.rows[0].nft_count : 0
}

export const getCollectionsInUpdateAuthority = async (updateAuthorities: string[], connection: Database): Promise<nftCollection[]> => {
    const queryString: string = `SELECT * FROM nft_collections WHERE updateAuthority IN (${JSON.stringify(updateAuthorities).slice(1,-1)})`
    console.log(`queryString ${queryString}`)

    try {   
        const statement = new SqlStatement(queryString, [])
        console.log('querying table')
        const results = await connection.sqlQuery<nftCollection>(statement, true)
        console.log(`rows: ${JSON.stringify(results.rows)}`)
        return results.rows
    } catch(error) {
        console.log('nftCollectionQueries@getCollectionsInUpdateAuthority')
        throw(error)
    }

}


