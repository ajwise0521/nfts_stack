import { messageAttributeMap, produceSqsMessage } from '../helpers/misc'
import { getAllCollectionConfigRecords } from '../lambda/controllers/DynamoDb'
import { CollectionConfig } from './configuration/collection'
import { config } from 'dotenv'
config()
export const handle = async () => {
    const collections: CollectionConfig[] = await getAllCollectionConfigRecords()

    console.log(`collections: ${JSON.stringify(collections)}`)
    console.log(`sqs url: ${process.env.SALES_BOT_QUEUE_URL}`)
    await Promise.all(collections.map(async (collection) => {
        console.log(`collection: ${JSON.stringify(collection)}`)
        const attributeMap: messageAttributeMap[] = [{
            name: 'collection',
            stringValue: JSON.stringify(collection)
        }]
        const response = await produceSqsMessage('Collection Sqs Message', attributeMap, process.env.SALES_BOT_QUEUE_URL ?? '')
        console.log(`sqs response: ${JSON.stringify(response)}`)
    }))
}