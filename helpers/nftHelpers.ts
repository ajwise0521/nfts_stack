import * as solanaWeb3 from '@solana/web3.js'
import * as solNfts from '@nfteyez/sol-rayz'
import Database from '../db/base/Database'
import {getCollectionsInUpdateAuthority} from '../db/sql/nftCollectionQueries'
import { nftCollection } from '../db/tables/nftCollections'
import { isNil, isUndefined } from 'lodash'
import { MagicEden, MagicEdenMetadata, MagicEdenMetadataResults } from '../lambda/controllers/magicEden'
const solConnection = solNfts.createConnectionConfig(solanaWeb3.clusterApiUrl("mainnet-beta"))
export const marketplaceMap: Record<string, string> = {
    "M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K": "Magic Eden v2",
    "MEisE1HzehtrDpAAT8PnLHjpSSkRYakotTuJRPjTpo8": "Magic Eden v1",
    "CJsLwbP1iu5DuUikHEJnLfANgKy6stB2uFgvBBHoyxwz": "Solanart",
    "HZaWndaNWHFDd9Dhk5pqUUtsmoBCqzb1MLu3NAh1VX6B": "AA"
}
const mapFromUpdateAuthorities = ['6NA69K8LrN283crJyWkjYMujs9bgQ2BP2pneGp3D3m1e']
const mapToUpdateAuthorities = ['TTJoQpxrRboWp6Kx2jGKGwj7ABq8sqw7vidMEjsoifb']
export const getWalletsNfts = async (wallet: string, connection: Database) => {

    try {
        let walletNfts: nftsAlternative[] = await solNfts.getParsedNftAccountsByOwner({
                publicAddress: wallet,
                connection: solConnection
        })
        let collections: NftWalletCollection[] = [{
            nfts: []
        }]
        let currIndex = 0
        let currCollection = walletNfts[currIndex].updateAuthority
        let collectionUAs = [walletNfts[currIndex].updateAuthority]

        const newWalletNfts = walletNfts.forEach((walletNft, i) => {
            const index = mapFromUpdateAuthorities.findIndex(element => element === walletNft.updateAuthority)
            if(index != -1) {
                walletNft.updateAuthority = mapToUpdateAuthorities[index]
            }
            if(walletNft.updateAuthority == currCollection) {
                collections[currIndex].nfts.push(walletNft)
            } else if(collectionUAs.findIndex(element => element == walletNft.updateAuthority) !== -1) {
                const tempIndex = collectionUAs.findIndex(element => element == walletNft.updateAuthority)
                collections[tempIndex].nfts.push(walletNft)
            }
             else {
                collections.push({
                    nfts: [walletNft]
                })
                currIndex = currIndex + 1
                currCollection = walletNft.updateAuthority
                collectionUAs.push(walletNft.updateAuthority)
            }
        })
        const updateAuthorities: string[] = []

        walletNfts.forEach(nft => {
            if(!updateAuthorities.includes(nft.updateAuthority)) {
                updateAuthorities.push(nft.updateAuthority)
            }
        })
        const nftCollections = await getCollectionsInUpdateAuthority(updateAuthorities, connection)

        collections.forEach(collection => {
            collection.count = collection.nfts.length
            collection.collection = getNftCollectionByUpdateAuthority(collection.nfts[0].updateAuthority, nftCollections)
        })

        return {
            totalCount: walletNfts.length,
            collections: collections,
        }
    } catch(error) {
        console.log('nftHelpers@getWalletNfts')
        throw(error)
    }
}

export const getNftCollectionByUpdateAuthority = (updateAuthority: string, collections: nftCollection[]): nftCollection | {}  => {
    const collection = collections.filter(collection => {
        return collection.updateAuthority == updateAuthority
    })
    return collection ? collection[0] : {}
}


export const getCollectionRecentSales = async (royaltyAddress: string): Promise<MagicEdenMetadataResults[]> => {
    const projectPubKey = new solanaWeb3.PublicKey(royaltyAddress)

    const signatures = await solConnection.getSignaturesForAddress(projectPubKey, {}, 'finalized')
    const marketplaceSales: MagicEdenMetadataResults[] = []
    const magicEden = new MagicEden()
    for (let i = 0; i <= signatures.length - 1; i++) {
        try {
            let { signature } = signatures[i]
            const txn: solanaWeb3.TransactionResponse | null = await solConnection.getTransaction(signature)
            if(isNil(txn) || isUndefined(txn) ) { continue }
            const price = txn.meta ? Math.abs((txn.meta.preBalances[0] - txn.meta.postBalances[0])) / solanaWeb3.LAMPORTS_PER_SOL : 0
            const accounts = txn.transaction.message.programIds()
            const marketplaceAccount = accounts[accounts.length - 1].toString()
            const isValid = !txn.meta?.logMessages?.some((log) =>
            log.includes("Sale cancelled by seller")
          );
          let metadata: MagicEdenMetadataResults
            if(marketplaceMap[marketplaceAccount] && isValid) {
                 metadata = (!isNil(txn?.meta) && !isNil(txn?.meta?.postTokenBalances)) ? (await magicEden.getMetadata(txn.meta.postTokenBalances[0].mint)).results : {} as MagicEdenMetadataResults
                if(!metadata) {
                    console.log('couldnt get metadata')
                    continue
                } else {
                    metadata.price = price
                    marketplaceSales.push(metadata)
                    if(marketplaceSales.length >= 20) {
                        break;
                    }
                }
            } else {
                continue;
            }
        } catch(error) {
            console.log(`Error getting recent sales: ${error instanceof Error ? error.message : 'unknown error'}`)
            return marketplaceSales
        }
    }
    return marketplaceSales
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

export interface NftWalletCollection {
    collection?: nftCollection | {}
    count?: number
    nfts: nftsAlternative[]
}
interface groupedAlternative { 
    wallet: string,
    mint: string,
    name: string, 
    id: number
    rank: number|null
}