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
import { handle as getAvailableTags} from '../lambda/handlers/getAvailableTags'
import { handle as getTargetTags } from '../lambda/handlers/getTargetTags'
import { handle as getMagicEdenCollections } from '../lambda/handlers/getMagicEdenCollections'
import { handle as getCollectionsUpdateAuthorities} from '../lambda/handlers/getCollectionsUpdateAuthorities'
import { handle as getAllCollections } from '../lambda/handlers/getAllCollections'
import { handle as getWatchListCollections } from '../lambda/handlers/getWatchlistCollections'
import { handle as postWatchlistCollection } from '../lambda/handlers/postWatchlistCollection'
import { handle as deleteWatchlistCollection} from '../lambda/handlers/deleteWatchlistCollection'
import { handle as getCollectionStats } from '../lambda/handlers/getMagicEdenCollectionStats'
import { handle as getCollectionStatsHistory } from '../lambda/handlers/getCollectionStatsHistory'
import { handle as fetchOutdatedStats } from '../lambda/handlers/fetchOutdatedCollectionStats'
const url = solanaWeb3.clusterApiUrl('mainnet-beta')
const solanaConnection = new solanaWeb3.Connection(url, 'confirmed')

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
    
    const lastKnownSignature = '2Y2xCetBUSwK2av9SaQmmRd2RrS78XTZNQe1cqUNv33xzQX6j7Ya58Padscd1HJDLkHuGYAX53wefFL5h7uoTeJE'
    const projectPubKey = new solanaWeb3.PublicKey('TTJoQpxrRboWp6Kx2jGKGwj7ABq8sqw7vidMEjsoifb')
    const signatures = await solanaConnection.getSignaturesForAddress(projectPubKey, {until: lastKnownSignature}, 'finalized')
    console.log(JSON.stringify(signatures))
    console.log(signatures.length)
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
    // const response = await getAvailableTags({
    //     body: '', 
    //     headers: {}, 
    //     multiValueHeaders: {}, 
    //     httpMethod: 'GET', 
    //     isBase64Encoded: true,
    //     path: '',
    //     pathParameters: {walletId: 'HcbnbYctUWHFndNQGpNGnicDpDn2fSt3AscfrM3j7JT8'},
    //     queryStringParameters: {updateAuthority: 'FLUNK9i7TNDV6C8n73yoRTJXb9mt2JCqEoBkCVZ7ipDK'},
    //     multiValueQueryStringParameters: {},
    //     stageVariables: {},
    //     requestContext: {} as APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
    //     resource: ''
    // })

    //    const response = await getWalletContents({
    //     body: '', 
    //     headers: {}, 
    //     multiValueHeaders: {}, 
    //     httpMethod: 'GET', 
    //     isBase64Encoded: true,
    //     path: '',
    //     pathParameters: {walletId: 'E2T7WbvrJa4ss6bW37JqURK2Gyu2zBAP4t8qgLZYJfGX'},
    //     queryStringParameters: {updateAuthority: 'TTJoQpxrRboWp6Kx2jGKGwj7ABq8sqw7vidMEjsoifb'},
    //     multiValueQueryStringParameters: {},
    //     stageVariables: {},
    //     requestContext: {} as APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
    //     resource: ''
    // })

    

        // const response = await getTargetTags({
    //     body: '', 
    //     headers: {}, 
    //     multiValueHeaders: {}, 
    //     httpMethod: 'GET', 
    //     isBase64Encoded: true,
    //     path: '',
    //     pathParameters: {},
    //     queryStringParameters: {
    //         walletId: '9tZgnXncsbCahHn8nbxe952Jayn5apMkQtyvyVYi3RWR',
    //         target: 'Fh9VmGFdzWwE7uKrhq9oAENqZotfHNrJK1K826zXUpz7',
    //         tagTypeId: '1'
    //     },
    //     multiValueQueryStringParameters: {},
    //     stageVariables: {},
    //     requestContext: {} as APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
    //     resource: ''
    // })

    // const response = await getAllCollections({
    //     body: '', 
    //     headers: {
    //         'wallet-verification-token': 'e62bf115-b01b-5a40-99e8-f8717cac1577'
    //     }, 
    //     multiValueHeaders: {}, 
    //     httpMethod: 'GET', 
    //     isBase64Encoded: true,
    //     path: '',
    //     pathParameters: {},
    //     queryStringParameters: {},
    //     multiValueQueryStringParameters: {},
    //     stageVariables: {},
    //     requestContext: {} as APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
    //     resource: ''
    // })

    // const response = await getWatchListCollections({
    //     body: '', 
    //     headers: {}, 
    //     multiValueHeaders: {}, 
    //     httpMethod: 'GET', 
    //     isBase64Encoded: true,
    //     path: '',
    //     pathParameters: {walletAddress: '3fcREq7WrSXYpqm2siXhPUR8iWsTovnkdm18DwqXVYnt'},
    //     queryStringParameters: {},
    //     multiValueQueryStringParameters: {},
    //     stageVariables: {},
    //     requestContext: {} as APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
    //     resource: ''
    // })

    // const response = await postWatchlistCollection({
    //     body: JSON.stringify({
    //         walletAddress: '3fcREq7WrSXYpqm2siXhPUR8iWsTovnkdm18DwqXVYnt',
    //         collectionId: 515
    //     }), 
    //     headers: {}, 
    //     multiValueHeaders: {}, 
    //     httpMethod: 'GET', 
    //     isBase64Encoded: true,
    //     path: '',
    //     pathParameters: {},
    //     queryStringParameters: {},
    //     multiValueQueryStringParameters: {},
    //     stageVariables: {},
    //     requestContext: {} as APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
    //     resource: ''
    // })


    // const response = await deleteWatchlistCollection({
    //     body: JSON.stringify({
    //         walletAddress: '3fcREq7WrSXYpqm2siXhPUR8iWsTovnkdm18DwqXVYnt',
    //         collectionId: 515
    //     }), 
    //     headers: {}, 
    //     multiValueHeaders: {}, 
    //     httpMethod: 'DELETE', 
    //     isBase64Encoded: true,
    //     path: '',
    //     pathParameters: {},
    //     queryStringParameters: {},
    //     multiValueQueryStringParameters: {},
    //     stageVariables: {},
    //     requestContext: {} as APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
    //     resource: ''
    // })

//     const response = await getCollectionStats({
//         body: '', 
//         headers: {}, 
//         multiValueHeaders: {}, 
//         httpMethod: 'GET', 
//         isBase64Encoded: true,
//         path: '',
//         pathParameters: {collectionName: 'cyber_pharmacies'},
//         queryStringParameters: {},
//         multiValueQueryStringParameters: {},
//         stageVariables: {},
//         requestContext: {} as APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
//         resource: ''
//     })

//     console.log(`response: ${JSON.stringify(response)}`)
// }

// const response = await getCollectionStatsHistory({
//     body: '', 
//     headers: {}, 
//     multiValueHeaders: {}, 
//     httpMethod: 'GET', 
//     isBase64Encoded: true,
//     path: '',
//     pathParameters: {collectionId: '14205'},
//     queryStringParameters: {},
//     multiValueQueryStringParameters: {},
//     stageVariables: {},
//     requestContext: {} as APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
//     resource: ''
// })

// const response = await fetchOutdatedStats()

const response = await getCollectionsUpdateAuthorities()
// const response = await getMagicEdenCollections()

console.log(`response: ${JSON.stringify(response)}`)
return
}


handler()

