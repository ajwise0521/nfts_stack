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
export const getNftsDatabase = (construct: Construct, vpc: aws_ec2.IVpc, props: StackProps) => {

        const securityGroup = buildSecurityGroup(
            construct,
            'CargotelSyncRDSSG',
            vpc,
            'CargotelSyncRDSSG',
            rdsPeerLists['prod'],
            3306)
        const dbId = props?.stackName?.split('-')[1] == 'Stage' ? 'NftsDatabaseStage' : 'NftsDatabase'

        const instanceProps = buildDatabaseInstanceProps(vpc, [securityGroup], dbId)
        const db = new aws_rds.DatabaseInstance(construct, dbId, instanceProps)

} 