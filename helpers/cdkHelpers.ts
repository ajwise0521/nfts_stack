import {
    aws_lambda_nodejs as lambda,
    aws_iam,
    aws_apigateway,
    Stack,
    aws_ec2
} from 'aws-cdk-lib'
import {
    Credentials,
    DatabaseInstanceEngine,
    DatabaseInstanceProps,
    MysqlEngineVersion,
    ParameterGroup
} from "aws-cdk-lib/aws-rds";
import {InstanceClass, InstanceSize, InstanceType, IVpc, SecurityGroup } from "aws-cdk-lib/aws-ec2";
import { APIGatewayProxyResult } from "aws-lambda"
import { Construct } from 'constructs'
import {Duration, RemovalPolicy} from "aws-cdk-lib";
export function addLambdaApiPermission(
    lambdaFunction: lambda.NodejsFunction,
    restApi: aws_apigateway.SpecRestApi,
    stack: Stack
  ) {
    lambdaFunction.addPermission("Invoke", {
      sourceArn: `arn:${stack.partition}:execute-api:${stack.region}:${stack.account}:${restApi.restApiId}/*`,
      principal: new aws_iam.ServicePrincipal("apigateway.amazonaws.com"),
    });
  }
  export const MYSQL_PORT = 3306
  export const engine = DatabaseInstanceEngine.mysql({version: MysqlEngineVersion.VER_8_0_26})
  export type NamedPeers = { [index: string]: aws_ec2.IPeer }

  export const buildSecurityGroup = (
    scope: Construct,
    id: string,
    vpc: IVpc,
    name: string,
    namedPeers: NamedPeers,
    port: number): SecurityGroup => {
    const sg = new SecurityGroup(
        scope,
        id,
        {
            securityGroupName: name,
            vpc
        })
    for (const peerName in namedPeers) {
        const peer = namedPeers[peerName]
        if (peer !== undefined) {
            sg.addIngressRule(peer, aws_ec2.Port.tcp(port), peerName)
        }
    }

    return sg
}

  export const buildDatabaseInstanceProps = (
    vpc: IVpc,
    securityGroups: SecurityGroup[]
    ): DatabaseInstanceProps => {

    return {
        engine,
        port: MYSQL_PORT,
        vpc,
        vpcSubnets: {
            subnetGroupName: `Public`
        },
        publiclyAccessible: true,
        securityGroups,
        instanceType: InstanceType.of(InstanceClass.T4G, InstanceSize.SMALL),
        instanceIdentifier: 'nfts-database',
        credentials: Credentials.fromGeneratedSecret('admin', {secretName: 'NftsDatabaseSecret'}),
        backupRetention: Duration.days(2),
        preferredBackupWindow: '08:00-08:30',
        preferredMaintenanceWindow: 'sun:06:00-sun:06:30',
        allocatedStorage: 300,
        maxAllocatedStorage: 600,
        allowMajorVersionUpgrade: false,
        autoMinorVersionUpgrade: false,
        removalPolicy: RemovalPolicy.DESTROY
    }
}

export const getAllowedResponseHeaders = () => {
    return { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
    }
}

export const generateResponse = (results: object, success: boolean, statusCode: number, error?: string|Error|unknown): APIGatewayProxyResult => {
    const body: WalletApiBaseResponseBody = {
        results,
        success
    }
    if(error && !success) {
        body.error = error instanceof Error ? error.message : 'unknown error'
    }
    return {
        body: JSON.stringify(body),
        statusCode,
        headers: getAllowedResponseHeaders()
    }
}

export interface WalletApiBaseResponseBody {
    results: object
    success: boolean
    error?: string
}

