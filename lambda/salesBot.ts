import * as solanaWeb3 from '@solana/web3.js'
import { programs } from '@metaplex/js'
import axios from 'axios'
import { config } from 'dotenv'
import { CollectionConfig as ConfigClass } from './configuration/collection'
import { isUndefined, isNil, last }  from 'lodash'
import { postSaleToDiscord } from '../helpers/misc'
import { setCollectionLastKnownSignature } from '../lambda/controllers/DynamoDb'
config()

const url = solanaWeb3.clusterApiUrl('mainnet-beta')
const solanaConnection = new solanaWeb3.Connection(url, 'confirmed')
const { metadata: { Metadata } } = programs
const pollingInterval = 60000

const marketplaceMap: Record<string, string> = {
    "M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K": "Magic Eden v2",
    "MEisE1HzehtrDpAAT8PnLHjpSSkRYakotTuJRPjTpo8": "Magic Eden v1",
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA": "Solanart",
    "HZaWndaNWHFDd9Dhk5pqUUtsmoBCqzb1MLu3NAh1VX6B": "AA"
}

export const runSalesBot = async (event: any) => {

        console.log(`collection: ${JSON.stringify(event.Records[0].messageAttributes['collection'].stringValue)}`)
        try {
            const collectionConfig: ConfigClass = JSON.parse(event.Records[0].messageAttributes['collection'].stringValue)
            console.log(`collectionConfig: ${JSON.stringify(collectionConfig)}`)
            if(isUndefined(collectionConfig)) {
                console.log(`configuration not found`)
                return
            }
            if(!collectionConfig.collectionRoyaltyAddress || !collectionConfig.webhookUrl) {
                console.log('please set your configuration variables')
                return;
            }
            const projectPubKey = new solanaWeb3.PublicKey(collectionConfig.collectionRoyaltyAddress)
        
            let lastKnownSignature: string = collectionConfig.lastKnownSignature
            const options: solanaWeb3.SignaturesForAddressOptions = {}
            options.until = lastKnownSignature
            const signatures = await solanaConnection.getSignaturesForAddress(projectPubKey, options, 'confirmed')
            if(signatures.length === 0) {
                console.log(`No new signatures for ${collectionConfig.collectionName} collection. Ending process`)
                return
            }
            console.log(`${signatures.length} new signatures`)
            for (let i = signatures.length - 1; i >=0; i--) {
                try {
                    let { signature } = signatures[i]
                    lastKnownSignature = signature
                    const txn: solanaWeb3.TransactionResponse | null = await solanaConnection.getTransaction(signature)
                    if(isNil(txn) || isUndefined(txn) ) { continue }
                    const dateString = txn?.blockTime ? new Date(txn?.blockTime * 1000).toLocaleString("en-US", {timeZone: "America/Chicago"}) : ''
                    const price = txn.meta ? Math.abs((txn.meta.preBalances[0] - txn.meta.postBalances[0])) / solanaWeb3.LAMPORTS_PER_SOL : 0
                    const accounts = txn.transaction.message.accountKeys
                    console.log(JSON.stringify(accounts))
                    const marketplaceAccount = accounts[accounts.length - 1].toString()
    
                    if(marketplaceMap[marketplaceAccount]) {
                        const metadata = (!isNil(txn?.meta) && !isNil(txn?.meta?.postTokenBalances)) ? await getMetadata(txn.meta.postTokenBalances[0].mint) : ''
                        if(!metadata) {
                            console.log('couldnt get metadata')
                            continue
                        }
                        await postSaleToDiscord(metadata.name, price, dateString, signature, metadata.results.img, collectionConfig)
                    } else {
                        console.log('not a supported marketplace sale')
                    }
                } catch(err) {
                    console.log(`error while going through signatures: ${err instanceof Error ? JSON.stringify(err) : err}`)
                    continue
                }
            }
            console.log(`lastKnownSignature: ${lastKnownSignature}`)
            await setCollectionLastKnownSignature(collectionConfig, lastKnownSignature)
        } catch(err) {
            console.log(`error fetching signatures: ${err instanceof Error ? JSON.stringify(err) : err}`)
            return
        }

}

const getMetadata = async(mintAddress: string) => {
    try {
        const { data } = await axios.get(`https://api-mainnet.magiceden.dev/rpc/getNFTByMintAddress/${mintAddress}`)

        return data
    } catch(err) {
        console.log("error fetching medtadata: ")
    }
}
