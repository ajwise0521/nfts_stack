import {
    aws_apigateway,
    StackProps,
    Stack,
    aws_ec2
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambdas from '../Lambdas/walletViewerLambdas'
import { addLambdaApiPermission } from '../../helpers/cdkHelpers'

export const getWalletViewerApi = (construct: Construct, vpc: aws_ec2.IVpc) => {

    const defaultIntegrationOptions: aws_apigateway.IntegrationOptions = {
        requestTemplates: {'application/json': '{ "statusCode": "200" }'}
    }
    // lambdas

    const getWalletContentsLambda = lambdas.getWalletContents(construct, vpc)
    const getWalletCollectionsLambda = lambdas.getWalletCollections(construct, vpc)

    // =============================================================

    // API
    const api = new aws_apigateway.RestApi(construct, 'WalletViewerApi', {
        restApiName: 'Wallet Vierer Api',
        description: 'Deals with gathering information for the front end',
        deployOptions: {
            stageName: 'Prod'
        }
    })
    // =============================================================
    
    // API Resources
    const walletResource = api.root.addResource('wallet')
    const walletCollectionResource = walletResource.addResource('collections')
    const walletIdResource = walletResource.addResource('{walletId}')
    // =============================================================

    // API Methods
    const getWalletContentMethod = walletIdResource.addMethod(
        'GET',
        new aws_apigateway.LambdaIntegration(getWalletContentsLambda, defaultIntegrationOptions),
        {
            apiKeyRequired: true
        }
    )

    const walletCollectionsIdResource = walletCollectionResource.addResource('{walletId}')
    const getWalletCollectionsMethod = walletCollectionsIdResource.addMethod(
        'GET',
        new aws_apigateway.LambdaIntegration(getWalletCollectionsLambda, defaultIntegrationOptions), 
        {
            apiKeyRequired: true
        }
    )
    // =============================================================

    // Usage Plan
    const usagePlan = api.addUsagePlan('walletUsagePlan', {
        name: 'usage plans',
        throttle: {
            rateLimit: 100,
            burstLimit: 300
        }
        })
    // =============================================================
    
    // api key
        const key = api.addApiKey('getWalletKey', {
        apiKeyName: 'get-wallet-key',
        })

        usagePlan.addApiKey(key)
        usagePlan.addApiStage({
        stage: api.deploymentStage,
        throttle: [
            {
            method: getWalletContentMethod,
            throttle: {
                rateLimit: 100,
                burstLimit: 300
            }
            }, 
            {
                method: getWalletCollectionsMethod,
                throttle: {
                    rateLimit: 100,
                    burstLimit: 300
                }
            }
        ]
        })
    // =============================================================
    
    // lambda permissions
    addLambdaApiPermission(getWalletContentsLambda, api, Stack.of(construct))
    addLambdaApiPermission(getWalletCollectionsLambda, api, Stack.of(construct))
}