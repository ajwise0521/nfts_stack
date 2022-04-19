import { messageAttributeMap, produceSqsMessage } from '../helpers/misc'
import { getAllCollectionConfigRecords } from '../lambda/controllers/DynamoDb'
import { CollectionConfig } from './configuration/collection'
import { config } from 'dotenv'
import * as solanaWeb3 from '@solana/web3.js'
config()
const url = solanaWeb3.clusterApiUrl('mainnet-beta')
const solanaConnection = new solanaWeb3.Connection(url, 'confirmed')

export const handle = async () => {
    const collections: CollectionConfig[] = await getAllCollectionConfigRecords()

    console.log(`collections: ${JSON.stringify(collections)}`)
    await Promise.all(collections.map(async (collection) => {
        const projectPubKey = new solanaWeb3.PublicKey(collection.collectionRoyaltyAddress)
        const signatures = await solanaConnection.getSignaturesForAddress(projectPubKey, {until: collection.lastKnownSignature}, 'finalized')
        if(signatures.length > 0) {
            const attributeMap: messageAttributeMap[] = [{
                name: 'collection',
                stringValue: JSON.stringify(collection)
            }]
            const response = await produceSqsMessage('Collection Sqs Message', attributeMap, process.env.SALES_BOT_QUEUE_URL ?? '')
            console.log(`sqs response: ${JSON.stringify(response)}`)
        }
    }))
}