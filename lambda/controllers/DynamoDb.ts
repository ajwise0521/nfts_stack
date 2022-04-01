import { DocumentClient } from "aws-sdk/clients/dynamodb";
import {DynamoDBClient, GetItemCommand} from "@aws-sdk/client-dynamodb";
import { PutCommand, PutCommandInput} from "@aws-sdk/lib-dynamodb";
import { TableNames } from "../../lib/Tables";
import { isUndefined, isNil, isEmpty } from "lodash";
import { CollectionConfig } from "../configuration/collection";
import { unmarshall } from "@aws-sdk/util-dynamodb"

const dbClient = new DynamoDBClient({})

export const getAllCollectionConfigRecords = async (): Promise<CollectionConfig[]> => {
    const docClient = new DocumentClient({})
    const params: DocumentClient.ScanInput = {
        TableName: TableNames.CollectionConfiguration,
    };

    const scanResults: DocumentClient.AttributeMap[] = [];
    let items: DocumentClient.ScanOutput;
    do{
        items =  await docClient.scan(params).promise();
        if(isUndefined(items) || isUndefined(items.Items)) {
            return scanResults as CollectionConfig[]
        }
        items.Items.forEach((item) => scanResults.push(item));
        params.ExclusiveStartKey  = items.LastEvaluatedKey;
    }while(typeof items.LastEvaluatedKey !== "undefined");
    
    return scanResults as CollectionConfig[]
}

export const getCollectionConfiguration = async (collectionName: string): Promise<CollectionConfig> => {
    let data: {[p: string]: any} | null | CollectionConfig = []
    try {
        if(isNil(collectionName) || isEmpty(collectionName)) {
            return {} as CollectionConfig
        }
        const command = new GetItemCommand({
            TableName: TableNames.CollectionConfiguration,
            Key: {
                collectionName: { S: collectionName }
            }
        })

        const response = await dbClient.send(command)

        data = response.Item ? unmarshall(response.Item, {wrapNumbers: false}) : null

    } catch(error) {
        console.log(`Error getting customer configuration: ${(error instanceof Error) ? error.message : 'unknown error'}`)
        return {} as CollectionConfig
    }
    return data as CollectionConfig
}

export const setCollectionLastKnownSignature = async(collection: CollectionConfig, lastKnownSignature: string) => {
    const putCommandInput: PutCommandInput = {
        TableName: TableNames.CollectionConfiguration,
        Item: {
            collectionName: collection.collectionName,
            collectionRoyaltyAddress: collection.collectionRoyaltyAddress,
            webhookUrl: collection.webhookUrl,
            user: collection.user,
            userAvatar: collection.userAvatar,
            authorName: collection.authorName,
            authorUrl: collection.authorUrl,
            authorIconUrl: collection.authorIconUrl,
            title: collection.title,
            description: collection.description,
            lastKnownSignature: lastKnownSignature
        }
    }

    const response = await dbClient.send(new PutCommand(putCommandInput))
    return true;
}