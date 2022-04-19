import {
    aws_apigateway,
    StackProps,
    Stack,
    aws_ec2,
    aws_lambda_nodejs
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as walletViewerlambdas from '../Lambdas/walletViewerLambdas'
import { addLambdaApiPermission } from '../../helpers/cdkHelpers'

export const getWalletViewerApi = (construct: Construct, vpc: aws_ec2.IVpc, props: StackProps) => {

    const defaultIntegrationOptions: aws_apigateway.IntegrationOptions = {
        requestTemplates: {'application/json': '{ "statusCode": "200" }'}
    }
    const defaultAllowedHeaders = ['*']
    const defaultMethodOptions = {
        apiKeyRequired: true,
        methodResponses: [{
            'statusCode': '200',
            'responseParameters': {
                'method.response.header.Access-Control-Allow-Origin': true,
                'method.response.header.Access-Control-Allow-Headers': true
            },
            'requestParameters': {
                'method.response.header.Access-Control-Allow-Origin': true,
                'method.response.header.Access-Control-Allow-Headers': true
            }
        }]
    }
    // lambdas
    const lambdas: aws_lambda_nodejs.NodejsFunction[] = []
    const getWalletContentsLambda = walletViewerlambdas.getWalletContents(construct)
    lambdas.push(getWalletContentsLambda)
    const getWalletCollectionsLambda = walletViewerlambdas.getWalletCollections(construct, vpc)
    lambdas.push(getWalletCollectionsLambda)
    const getMECollectionStatsLambda = walletViewerlambdas.getMECollectionStats(construct)
    lambdas.push(getMECollectionStatsLambda)
    const getHowRareCollectionRanks = walletViewerlambdas.getHowRareCollectionRanks(construct)
    lambdas.push(getHowRareCollectionRanks)
    const getCollectionRecentSales = walletViewerlambdas.getCollectionRecentSales(construct)
    lambdas.push(getCollectionRecentSales)
    const getVerifiedCollectionsLambda = walletViewerlambdas.getVerifiedCollectionSales(construct)
    lambdas.push(getVerifiedCollectionsLambda)
    const postSuggestionLambda = walletViewerlambdas.postSuggestion(construct)
    lambdas.push(postSuggestionLambda)

    // =============================================================

    // API
    const api = new aws_apigateway.RestApi(construct, 'WalletViewerApi', {
        restApiName: 'WalletViererApi',
        description: 'Deals with gathering information for the front end',
        deployOptions: {
            stageName: props?.stackName?.split('-')[1] || undefined
        },
    })
    // =============================================================
    
    // API Resources
    let resources: aws_apigateway.Resource[] = [] 
    const walletResource = api.root.addResource('wallet') // wallet
    resources.push(walletResource)
    const walletCollectionResource = walletResource.addResource('collections') // wallet/collections
    resources.push(walletCollectionResource)
    const walletIdResource = walletResource.addResource('{walletId}') // wallet/{walletId}
    resources.push(walletIdResource)
    const statsResource = api.root.addResource('stats')
    resources.push(statsResource)
    const statsResourceCollection = statsResource.addResource('{collectionName}')
    resources.push(statsResourceCollection)
    const ranksResource =  api.root.addResource('ranks')
    resources.push(ranksResource)
    const ranksCollectionResource = ranksResource.addResource('{collectionName}')
    resources.push(ranksCollectionResource)
    const collectionsResource = api.root.addResource('collections')
    resources.push(collectionsResource)
    const collectionSalesResource = collectionsResource.addResource('{royaltyAddress}')
    resources.push(collectionSalesResource)
    const verifiedCollectionsResource = api.root.addResource('verifiedCollections')
    resources.push(verifiedCollectionsResource)
    const postSuggestionResource = api.root.addResource('suggestion')
    resources.push(postSuggestionResource)
    postSuggestionResource
    resources.forEach(resource => {
        resource.addCorsPreflight({
            allowOrigins: aws_apigateway.Cors.ALL_ORIGINS,
            allowHeaders: defaultAllowedHeaders,
            allowMethods: aws_apigateway.Cors.ALL_METHODS
        })
    })


    // =============================================================

    // API Methods
    const getWalletContentMethod = walletIdResource.addMethod(
        'GET',
        new aws_apigateway.LambdaIntegration(getWalletContentsLambda, defaultIntegrationOptions),
        defaultMethodOptions
    )
    const getCollectionStatsMethod = statsResourceCollection.addMethod(
        'GET',
        new aws_apigateway.LambdaIntegration(getMECollectionStatsLambda, defaultIntegrationOptions),
        defaultMethodOptions
    )

    const getCollectionRanksMethod = ranksCollectionResource.addMethod(
        'GET',
        new aws_apigateway.LambdaIntegration(getHowRareCollectionRanks, defaultIntegrationOptions),
        defaultMethodOptions

    )

    const getCollectionSalesMethod = collectionSalesResource.addMethod(
        'GET',
        new aws_apigateway.LambdaIntegration(getCollectionRecentSales, defaultIntegrationOptions),
        defaultMethodOptions
        
    )

    const verifiedCollectionMethod = verifiedCollectionsResource.addMethod(
        'GET',
        new aws_apigateway.LambdaIntegration(getVerifiedCollectionsLambda, defaultIntegrationOptions),
        defaultMethodOptions
    )
    
    const postSuggestionMethod = postSuggestionResource.addMethod(
        'POST',
        new aws_apigateway.LambdaIntegration(postSuggestionLambda, defaultIntegrationOptions),
        defaultMethodOptions
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
        apiKeyName: props?.stackName?.split('-')[1] == 'Stage' ? 'get-wallet-key-stage' : 'get-wallet-key',
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
                method: getCollectionStatsMethod,
                throttle: {
                    rateLimit: 100,
                    burstLimit: 300
                }
            }
        ]
        })
    // =============================================================
    
    // lambda permissions
    lambdas.forEach(lambda => {
        addLambdaApiPermission(lambda, api, Stack.of(construct))
    })
}