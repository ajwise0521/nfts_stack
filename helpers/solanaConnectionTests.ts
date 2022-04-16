import * as solanaWeb3 from '@solana/web3.js'
import * as anchor from "@project-serum/anchor";
import * as solNfts from '@nfteyez/sol-rayz'
import { isNil, mapKeys } from 'lodash';
import { HowRare, HowRareResponse, HowRareCollectionItems } from '../lambda/controllers/howRare';
import { config } from 'dotenv'
import * as fs from 'fs'
import  { getWalletsNfts, getCollectionRecentSales } from './nftHelpers'
import MySqlDatabase from "../db/base/mysqlDatabase"
import { nftsDbConfig } from "../db/base/dbConfig"
import {getCollectionsInUpdateAuthority} from '../db/sql/nftCollectionQueries'
import { handle as getWalletContents } from '../lambda/handlers/getWalletContents'
import { isVerified } from '../lambda/controllers/verificationController'
import dayjs from 'dayjs'
import { handle as postSuggestion } from '../lambda/handlers/postSuggestion'
import { APIGatewayEventRequestContextWithAuthorizer, APIGatewayEventDefaultAuthorizerContext } from 'aws-lambda'
import { handle as getWalletCollections } from '../lambda/handlers/getWalletCollections'

config()
import { MagicEden, MagicEdenCollection } from '../lambda/controllers/magicEden';
const ajsWallets: string[] = ['HcbnbYctUWHFndNQGpNGnicDpDn2fSt3AscfrM3j7JT8', '3fcREq7WrSXYpqm2siXhPUR8iWsTovnkdm18DwqXVYnt', '9tZgnXncsbCahHn8nbxe952Jayn5apMkQtyvyVYi3RWR']
const ttUA: string[] = ['TTJoQpxrRboWp6Kx2jGKGwj7ABq8sqw7vidMEjsoifb', '6NA69K8LrN283crJyWkjYMujs9bgQ2BP2pneGp3D3m1e']
const nftsDatabaseConnection = new MySqlDatabase('NFTs Database Connection', nftsDbConfig)
import { handle as meCollectionStats } from '../lambda/handlers/getMagicEdenCollectionStats';
const writeToFile = (data: object) => {
    fs.writeFile("test.json", JSON.stringify(data, null, 2), function(err) {
        if (err) {
            console.log(err);
        }
    });
}

const getHowRareCollection = async(collectionName: string) => {
    try {
        const howRare = new HowRare()
        const data: HowRareResponse = await howRare.getCollectionRank(collectionName)
        const collectionData = data.result.data.items.reduce(
            (entryMap, e: HowRareCollectionItems) => entryMap.set(e.id, {rank: e.rank}),
            new Map()
        )
        const test = Object.fromEntries(collectionData)
        console.log(test['0'])

        return collectionData
    } catch(error) {
        console.log(`error: ${error instanceof Error ? error.message : 'unknown error'}`)
        return 'hi'
    }
}


const handle = async () => {
    // const nfts = await getWalletCollections('4GiPZP84ZphSPuV6FGX35npdvAbnL56tWKoKefVwzCGN', nftsDatabaseConnection)

    // console.log(JSON.stringify(nfts))
}


interface nftsAlternative {   
    mint: string;
    updateAuthority: string;
    data: {
        creators: any[];
        name: string;
        symbol: string;
        uri: string;
        sellerFeeBasisPoints: number;
    };
    key?: any
    primarySaleHappened: boolean;
    isMutable: boolean;
    editionNonce: number;
    masterEdition?: string;
    edition?: string;
    wallet?: string
}


interface groupedAlternative { 
    wallet: string,
    mint: string,
    name: string, 
    id: number
    rank: number|null
}
const handler = async () => {
    const response = await getWalletCollections({
        body: '', 
        headers: {}, 
        multiValueHeaders: {}, 
        httpMethod: 'GET', 
        isBase64Encoded: true,
        path: '',
        pathParameters: {walletId: 'HcbnbYctUWHFndNQGpNGnicDpDn2fSt3AscfrM3j7JT8'},
        queryStringParameters: {},
        multiValueQueryStringParameters: {},
        stageVariables: {},
        requestContext: {} as APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
        resource: ''
    })

    console.log(`response: ${JSON.stringify(response)}`)
}

handler()

