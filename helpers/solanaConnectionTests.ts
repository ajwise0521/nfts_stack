import * as solanaWeb3 from '@solana/web3.js'
import * as anchor from "@project-serum/anchor";
import * as solNfts from '@nfteyez/sol-rayz'
import { isNil, mapKeys } from 'lodash';
import { HowRare, HowRareResponse, HowRareCollectionItems } from '../lambda/controllers/howRare';
import { config } from 'dotenv'
import * as fs from 'fs'
import  { getWalletsNfts } from './nftHelpers'
import MySqlDatabase from "../db/base/mysqlDatabase"
import { nftsDbConfig } from "../db/base/dbConfig"
import {getCollectionsInUpdateAuthority} from '../db/sql/nftCollectionQueries'

config()
import { MagicEden, MagicEdenCollection } from '../lambda/controllers/magicEden';
const ajsWallets: string[] = ['HcbnbYctUWHFndNQGpNGnicDpDn2fSt3AscfrM3j7JT8', '3fcREq7WrSXYpqm2siXhPUR8iWsTovnkdm18DwqXVYnt', '9tZgnXncsbCahHn8nbxe952Jayn5apMkQtyvyVYi3RWR']
const ttUA: string[] = ['TTJoQpxrRboWp6Kx2jGKGwj7ABq8sqw7vidMEjsoifb', '6NA69K8LrN283crJyWkjYMujs9bgQ2BP2pneGp3D3m1e']
const nftsDatabaseConnection = new MySqlDatabase('NFTs Database Connection', nftsDbConfig)

const writeToFile = (data: object) => {
    fs.writeFile("test.json", JSON.stringify(data, null, 2), function(err) {
        if (err) {
            console.log(err);
        }
    });
}

const getHowRareCollection = async(collectionName: string) => {
    const howRare = new HowRare()

    const data: HowRareResponse = await howRare.getCollectionRank(collectionName)

    // console.log(`tigers: ${JSON.stringify(data.result.data.items[0])}`)

    const collectionData = data.result.data.items.reduce(
        (entryMap, e: HowRareCollectionItems) => entryMap.set(e.id, [...entryMap.get(e.id)||[], e]),
        new Map()
    )

    return collectionData
}

// const handle = async (collectionName: string, collectionAddresses: string[]) => {
//     const collectionData = await getHowRareCollection(collectionName)
//     console.log(JSON.stringify(collectionData.get('3954')[0].rank))
//     let nfts1 = await getWalletsNfts(ajsWallets[0])
//     const nfts2 = await getWalletsNfts(ajsWallets[1])
//     const nfts3 = await getWalletsNfts(ajsWallets[2])

//     nfts1 = nfts1.concat(nfts2)
//     nfts1 = nfts1.concat(nfts3)

//     let groupedMap = nfts1.reduce(
//         (entryMap, e) => entryMap.set(e.updateAuthority, [...entryMap.get(e.updateAuthority)||[], {wallet: e.wallet, mint: e.mint, name: e.data.name, id: Number(e.data.name.split('#').pop()), rank: null}]),
//         new Map()
//     );
//     groupedMap.forEach((value, key, map) => {
//         console.log(`${key}: ${JSON.stringify(value.length)}`)
//         console.log(value[0])
//     })
//     let updateAuth1: groupedAlternative[] = groupedMap.get('TTJoQpxrRboWp6Kx2jGKGwj7ABq8sqw7vidMEjsoifb')
//     updateAuth1 = updateAuth1.concat(groupedMap.get('6NA69K8LrN283crJyWkjYMujs9bgQ2BP2pneGp3D3m1e'))

//     updateAuth1.forEach(nft => {
//         nft.rank = collectionData.get(`${nft.id}`)[0].rank
//     })

//     console.log(`please: ${updateAuth1.length}`)

//     updateAuth1.sort((a: groupedAlternative, b: groupedAlternative) => {
//         if(isNil(a.rank) || isNil(b.rank)) {
//             return 1
//         }
//         return a.rank > b.rank ? -1 : 1
//     })

//     writeToFile(updateAuth1)

// }

const handle = async () => {
    const collections = await getCollectionsInUpdateAuthority([
        "146YB39aW94LuzLqjWKYGEDwZXUPm8BTiMeEXrd8EoDa",
        "6NA69K8LrN283crJyWkjYMujs9bgQ2BP2pneGp3D3m1e",
        "6cXiv9isqEnR1Z1zobJa6VgsBULZg1fGeyreu3Pna8hK",
        "DavatMsZc8QECxijH52pj8QKcSRXSfrzuCPeznh2Efs9",
        "FLUNK9i7TNDV6C8n73yoRTJXb9mt2JCqEoBkCVZ7ipDK",
        "TTJoQpxrRboWp6Kx2jGKGwj7ABq8sqw7vidMEjsoifb"
    ], nftsDatabaseConnection)

    console.log(`collections (${collections.length}): ${JSON.stringify(collections)}`)
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
    const nfts = await getWalletsNfts('3fcREq7WrSXYpqm2siXhPUR8iWsTovnkdm18DwqXVYnt')
    console.log(nfts)
}

handle()

