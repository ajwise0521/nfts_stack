import * as solanaWeb3 from '@solana/web3.js'
import { programs } from '@metaplex/js'
import axios from 'axios'
import { config } from 'dotenv'
import { CollectionConfig as ConfigClass } from './configuration/collection'
import { isUndefined, isNil, last }  from 'lodash'
import { postSaleToDiscord } from '../helpers/misc'
import { setCollectionLastKnownSignature } from '../lambda/controllers/DynamoDb'
import { MagicEden } from './controllers/magicEden'
import { marketplaceMap } from '../helpers/nftHelpers'
config()

const url = solanaWeb3.clusterApiUrl('mainnet-beta')
const solanaConnection = new solanaWeb3.Connection(url, 'finalized')
const { metadata: { Metadata } } = programs

export const runSalesBot = async (event: any) => {
        try {
            const collectionConfig: ConfigClass = JSON.parse(event.Records[0].messageAttributes['collection'].stringValue)
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
            const signatures = await solanaConnection.getSignaturesForAddress(projectPubKey, options, 'finalized')
            if(signatures.length === 0) {
                return
            }
            const magicEden = new MagicEden
            for (let i = signatures.length - 1; i >=0; i--) {
                try {
                    let { signature } = signatures[i]
                    lastKnownSignature = signature
                    const txn: solanaWeb3.TransactionResponse | null = await solanaConnection.getTransaction(signature)
                    if(isNil(txn) || isUndefined(txn) ) { continue }
                    const dateString = txn?.blockTime ? new Date(txn?.blockTime * 1000).toLocaleString("en-US", {timeZone: "America/Chicago"}) : ''
                    const price = txn.meta ? Math.abs((txn.meta.preBalances[0] - txn.meta.postBalances[0])) / solanaWeb3.LAMPORTS_PER_SOL : 0
                    const accounts = txn.transaction.message.programIds()
                    const marketplaceAccount = accounts[accounts.length - 1].toString()
                    const isValid = !txn.meta?.logMessages?.some((log) =>
                    log.includes("Sale cancelled by seller")
                  );
                    if(marketplaceMap[marketplaceAccount] && isValid) {
                        const metadata = (!isNil(txn?.meta) && !isNil(txn?.meta?.postTokenBalances)) ? await magicEden.getMetadata(txn.meta.postTokenBalances[0].mint) : ''
                        if(!metadata) {
                            console.log('couldnt get metadata')
                            continue
                        }
                        await postSaleToDiscord(metadata.results.collectionTitle, price, dateString, signature, metadata.results.img, collectionConfig)
                    } else {
                        console.log('not a supported marketplace sale')
                    }
                } catch(err) {
                    console.log(`error while going through signatures: ${err instanceof Error ? JSON.stringify(err) : err}`)
                    continue
                }
            }
            await setCollectionLastKnownSignature(collectionConfig, lastKnownSignature)
        } catch(err) {
            console.log(`error fetching signatures: ${err instanceof Error ? JSON.stringify(err) : err}`)
            return
        }

}
