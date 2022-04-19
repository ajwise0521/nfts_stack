import { SQS } from 'aws-sdk'
import axios from 'axios'
import { CollectionConfig as ConfigClass } from '../lambda/configuration/collection'
import * as solanaWeb3 from '@solana/web3.js'
import * as solNfts from '@nfteyez/sol-rayz'
export const produceSqsMessage = async (body: string, attributes: messageAttributeMap[], sqsUrl: string) => {
    const sqs = new SQS({
        region: 'us-east-1'
    })
    const response = await sqs.sendMessage({
        MessageBody: body,
        QueueUrl: sqsUrl,
        MessageGroupId: 'CarhaulAdapterFailures',
        MessageAttributes: mapMessageAttributes(attributes)
    }).promise()

    console.log(`sqs response: ${JSON.stringify(response)}`)
}

const mapMessageAttributes = (messageAttributes: messageAttributeMap[]): SQS.MessageBodyAttributeMap => {
    const attributesMap: SQS.MessageBodyAttributeMap = {}
    messageAttributes.forEach((attribute: messageAttributeMap) => {
        attributesMap[attribute.name] = {
            DataType: "String",
            StringValue: attribute.stringValue
        }
    })
    return attributesMap
}

export const postSaleToDiscord = async (title: string, price: number, date: string, signature: string, imageURL: string, collectionConfig: ConfigClass) => {
    try {
        await axios.post(collectionConfig.webhookUrl, {
            "username": `${collectionConfig.user}`,
            "avatar_url": `${collectionConfig.userAvatar}`,
            "embeds": [
            {
                "author": {
                    "name": `${collectionConfig.authorName}`,
                    "url": `${collectionConfig.authorUrl}`,
                    "icon_url": `${collectionConfig.authorIconUrl}`
                },
                "title": `${collectionConfig.title}`,
                "description": `${collectionConfig.description}`,
                "color": 15258703,
                "fields": [
                        {
                            "name": "Price",
                            "value": `${price} SOL`,
                            "inline": true
                        },
                        {
                            "name": "Date",
                            "value": `${date} CST`,
                            "inline": true
                        },
                        {
                            "name": "Explorer",
                            "value": `http://explorer.solana.com/tx/${signature}`
                        }
                ],
                "image": {
                    "url": `${imageURL}`
                },
                "footer": {
                "text": "Woah! So cool! :smirk:",
                "icon_url": "https://i.imgur.com/fKL31aD.jpg"
                }
            }
            ]
        })
    } catch(err) {
        console.log(`error posting to discord: ${err instanceof Error ? err.message : 'unknown error'}`)
        return
    }
}

export interface messageAttributeMap {
    name: string,
    stringValue: string
}

