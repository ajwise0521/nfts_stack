import { buildDatabaseInstanceProps, buildSecurityGroup } from '../../helpers/cdkHelpers'
import { rdsPeerLists } from '../../helpers/peers'
import {
    aws_rds,
    aws_ec2,
    StackProps
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { getVpc } from '../nft-wallet-viewer-stack'

export enum EnvironmentName {
    dev = 'dev' ,
    staging = 'staging',
    prod = 'prod'
}
export const getNftsDatabase = (construct: Construct, vpc: aws_ec2.IVpc) => {

        const securityGroup = buildSecurityGroup(
            construct,
            'CargotelSyncRDSSG',
            vpc,
            'CargotelSyncRDSSG',
            rdsPeerLists['prod'],
            3306)
        const instanceProps = buildDatabaseInstanceProps(vpc, [securityGroup])
        const db = new aws_rds.DatabaseInstance(construct, 'NftsDatabase', instanceProps)

} 