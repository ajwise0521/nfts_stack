import {
    aws_ec2,
    aws_lambda_nodejs as lambda,
    Duration
} from 'aws-cdk-lib'
import { SecurityGroup } from 'aws-cdk-lib/aws-ec2'
import { Construct } from 'constructs'
import { getVpc } from '../nft-wallet-viewer-stack'


export const getWalletContents = (construct: Construct, vpc: aws_ec2.IVpc): lambda.NodejsFunction => {
    return new lambda.NodejsFunction(construct, 'getWalletContents', {
        vpc,
        entry: 'lambda/handlers/getWalletContents.ts',
        handler: 'handle', 
        timeout: Duration.seconds(60),
        memorySize: 256,
    })
}

export const getWalletCollections = (construct: Construct, vpc: aws_ec2.IVpc): lambda.NodejsFunction => {
    return  new lambda.NodejsFunction(construct, 'getWalletCollections', {
        vpc,
        entry: 'lambda/handlers/getWalletCollections.ts',
        handler: 'handle',
        timeout: Duration.seconds(60),
        memorySize: 265,
    })
}