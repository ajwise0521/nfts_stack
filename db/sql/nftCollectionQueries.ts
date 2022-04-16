import { Connection } from "typeorm"
import { MagicEdenCollection } from "../../lambda/controllers/magicEden"
import Database from "../base/database"
import SqlStatement from "../base/sqlStatement"
import { nftCollectionCount, nftCollection, nftCollectionWithVerificationCount} from "../tables/nftCollections"
const nftUpdateInsertQuery = 'INSERT INTO nft_collections (symbol, name, image, twitter, discord, website) VALUES'
const onDuplicateKeyString = ' ON DUPLICATE KEY UPDATE symbol=VALUES(symbol), name=VALUES(name), image=VALUES(image), twitter=VALUES(twitter), discord=VALUES(discord), website=VALUES(website) '
const nftUpdateUpdateAuthorityInsertQuery = 'INSERT INTO nft_collections (symbol, updateAuthority) VALUES'
const onDuplicateKeyUpdateAuthroityString = ' ON DUPLICATE KEY UPDATE updateAuthority=VALUES(updateAuthority) '
import { VerificationCollection } from "../tables/verificationCollection";

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
                acc + ` ("${el.symbol}", "${el.name.replace(/"/g, '')}", "${el.image}", "${el.twitter}", "${el.discord}", "${el.website}") `
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
    try {   
        const statement = new SqlStatement(queryString, [])
        const results = await connection.sqlQuery<nftCollection>(statement, true)
        return results.rows
    } catch(error) {
        console.log('nftCollectionQueries@getCollectionsInUpdateAuthority')
        throw(error)
    }
}

export const getCollectionsWithoutUpdateAuthorities = async (connection: Database, count: number): Promise<nftCollection[]> => {
    try{
        const queryString = `SELECT * FROM nft_collections WHERE updateAuthority IS NULL LIMIT ${count}`
        const statement = new SqlStatement(queryString, [])
        const results = await connection.sqlQuery<nftCollection>(statement, true)
        return results.rows
    } catch(error) {
        console.log('Error getting collections without update authorities')
        throw(error)
    }
}

export const updateCollectionsUpdateAuthorities = async <T>(connection: Database, collections: nftCollection[]) => {
    let queryString: string = ''

    try {
        queryString = collections.reduce((acc: string, el: nftCollection, i) => {
            acc = i < collections.length  - 1? 
                acc + ` ("${el.symbol}", "${el.updateAuthority}"),` : 
                acc + ` ("${el.symbol}", "${el.updateAuthority}")`
            return acc
        }, nftUpdateUpdateAuthorityInsertQuery)

        if(queryString == nftUpdateUpdateAuthorityInsertQuery) {
            return ''
        }
        if(queryString[queryString.length - 1] === ' ') {
            queryString = queryString.slice(0, queryString.length - 2)
        }
        queryString += onDuplicateKeyUpdateAuthroityString;
        console.log(queryString)
        const statement = new SqlStatement(queryString, [])
        const result = await connection.sqlQuery<T>(statement, true)
        return 
    } catch(error) {
        console.log(`error inserting updateAuthorities ${error instanceof Error ? error.message : 'unknown error'}`)
        throw(error)
    }
}

export const getVerifiedCollectionsCollections = async(connection: Database): Promise<nftCollectionWithVerificationCount[]> => {
    const ids: number[] = []
    try {
        const queryString = `select nft_collections.*, verification_collections.required_count from verification_collections JOIN nft_collections ON verification_collections.collection_id = nft_collections.id`
        const statement = new SqlStatement(queryString, [])
        const results = await connection.sqlQuery<nftCollectionWithVerificationCount>(statement, true)
        return results.rows
    } catch(error) {
        console.log(`error mapping verified collection collections: ${error instanceof Error ? error.message : 'unknown error'}`)
        return []
    }
}


