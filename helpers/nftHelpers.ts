import * as solanaWeb3 from '@solana/web3.js'
import * as solNfts from '@nfteyez/sol-rayz'
import Database from '../db/base/Database'
import {getCollectionsInUpdateAuthority} from '../db/sql/nftCollectionQueries'
const solConnection = solNfts.createConnectionConfig(solanaWeb3.clusterApiUrl("mainnet-beta"))

export const getWalletsNfts = async (wallet: string, connection: Database) => {
    console.log("5")
    try {
        console.log('6')
        let walletNfts: nftsAlternative[] = await solNfts.getParsedNftAccountsByOwner({
                publicAddress: wallet,
                connection: solConnection
        })
        const updateAuthorities: string[] = []

        walletNfts.forEach(nft => {
            if(!updateAuthorities.includes(nft.updateAuthority)) {
                updateAuthorities.push(nft.updateAuthority)
            }
        })
        console.log('getting collections by UA')
        const collections = await getCollectionsInUpdateAuthority(updateAuthorities, connection)
        return {
            totalCount: walletNfts.length,
            nfts: walletNfts,
            collections: collections
        }
    } catch(error) {
        console.log('nftHelpers@getWalletNfts')
        throw(error)
    }
}

export const getWalletCollections = async (wallet: string, connection: Database) => {
    const walletNfts = await getWalletsNfts(wallet, connection)
    console.log('7')
    console.log(`walletNfts: ${JSON.stringify(walletNfts)}`)
    const updateAuthorities: string[] = []
    try {
        walletNfts.nfts.forEach(nft => {
            if(!updateAuthorities.includes(nft.updateAuthority)) {
                updateAuthorities.push(nft.updateAuthority)
            }
        })
        console.log('getting collections by UA')
        const collections = await getCollectionsInUpdateAuthority(updateAuthorities, connection)

        return collections
    } catch(error) {
        console.log('nftHelpers@getWalletConnections')
        throw(error)
    }
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
}


interface groupedAlternative { 
    wallet: string,
    mint: string,
    name: string, 
    id: number
    rank: number|null
}