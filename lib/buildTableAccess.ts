import { TableAccessGrantee } from "./Tables";
import { aws_iam as iam} from 'aws-cdk-lib'




export const grantTableAccess = (grantable: iam.IGrantable, tableName: string, read: boolean = false , write: boolean = false): TableAccessGrantee => {

    return {
            principal: grantable, 
            tables: [{ tableName, read, write }]
        }
}