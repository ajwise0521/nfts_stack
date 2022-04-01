import {isNil} from "lodash";
import {Construct} from 'constructs';
import { StackProps, aws_iam as iam, aws_dynamodb as dynamodb } from 'aws-cdk-lib'



interface TableAccess {
    tableName: string
    read?: boolean
    write?: boolean
}

export interface TableAccessGrantee {
    principal: iam.IGrantable
    tables: TableAccess[]
}

export enum TableNames {
    CollectionConfiguration = 'CollectionConfiguration',
}

export class Tables extends Construct{
    constructor(scope: Construct, id: string, accessGrantees: TableAccessGrantee[], props?: StackProps) {

        super(scope, id)

        const dbTables: Record<string, dynamodb.Table> = {}

        dbTables[TableNames.CollectionConfiguration] = this.createCollectionConfigurationTable()

        accessGrantees.forEach(grantee => {
            grantee.tables.forEach(table => {
                if (!isNil(dbTables[table.tableName])) {
                    if (table.read) {
                        dbTables[table.tableName].grantReadData(grantee.principal)
                    }
                    if (table.write) {
                        dbTables[table.tableName].grantWriteData(grantee.principal)
                    }
                }
            })
        })
    }

    createCollectionConfigurationTable = (): dynamodb.Table => {
        const table = new dynamodb.Table(this, TableNames.CollectionConfiguration, {
            tableName: TableNames.CollectionConfiguration,
            partitionKey: {name: 'collectionName', type: dynamodb.AttributeType.STRING},
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST
        })
        return table
    }
}