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
    const getWalletCollectionsLambda = walletViewerlambdas.getWalletCollections(construct)
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
    const moonRanksLambda = walletViewerlambdas.getMoonRankCollectionRanks(construct)
    lambdas.push(moonRanksLambda)
    const getAvailableTagsLambda = walletViewerlambdas.getAvailableTags(construct)
    lambdas.push(getAvailableTagsLambda)
    const getTargetTagsLambda = walletViewerlambdas.getTargetTags(construct)
    lambdas.push(getTargetTagsLambda)
    const getAllCollections = walletViewerlambdas.getAllCollections(construct)
    lambdas.push(getAllCollections)
    const getWatchlistCollectionsLambda = walletViewerlambdas.getWatchlistCollections(construct)
    lambdas.push(getWatchlistCollectionsLambda)
    const postWatchlistCollectionLambda = walletViewerlambdas.postWatchlistCollection(construct)
    lambdas.push(postWatchlistCollectionLambda)
    const deleteWatchlistCollectionLambda = walletViewerlambdas.deleteWatchlistCollection(construct)
    lambdas.push(deleteWatchlistCollectionLambda)
    const getCollectionStatsHistoryLambda = walletViewerlambdas.getCollectionStatsHistory(construct)
    lambdas.push(getCollectionStatsHistoryLambda)
    // =============================================================

    // API
    const api = new aws_apigateway.RestApi(construct, 'WalletViewerApi', {
        restApiName: 'WalletViewerApi',
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
    const walletCollectionsCollections = walletCollectionResource.addResource('{walletId}') // wallet/collections/{walletId}
    resources.push(walletCollectionsCollections)
    const walletIdResource = walletResource.addResource('{walletId}') // wallet/{walletId}
    resources.push(walletIdResource)
    const statsResource = api.root.addResource('stats')
    resources.push(statsResource)
    const statsResourceCollection = statsResource.addResource('{collectionName}')
    resources.push(statsResourceCollection)
    const ranksResource =  api.root.addResource('ranks')
    resources.push(ranksResource)
    const howRareRanksResource = ranksResource.addResource(`howRare`)
    resources.push(howRareRanksResource)
    const ranksCollectionResource = howRareRanksResource.addResource('{collectionName}')
    resources.push(ranksCollectionResource)
    const moonRanksResource = ranksResource.addResource('moonRank')
    resources.push(moonRanksResource)
    const moonRanksCollectionResource = moonRanksResource.addResource('{collectionName}')
    resources.push(moonRanksCollectionResource)
    const collectionsResource = api.root.addResource('collections')
    resources.push(collectionsResource)
    const collectionSalesResource = collectionsResource.addResource('{royaltyAddress}')
    resources.push(collectionSalesResource)
    const verifiedCollectionsResource = api.root.addResource('verifiedCollections')
    resources.push(verifiedCollectionsResource)
    const postSuggestionResource = api.root.addResource('suggestion')
    resources.push(postSuggestionResource)
    const tagsResource = api.root.addResource('tags')
    resources.push(tagsResource)
    const targetTagsResource = tagsResource.addResource('target')
    resources.push(targetTagsResource)
    const allCollectionsResource = collectionsResource.addResource('all')
    resources.push(allCollectionsResource)
    const watchListResource = api.root.addResource('watchList')
    resources.push(watchListResource)
    const watchListCollectionsResource = watchListResource.addResource('{walletAddress}')
    resources.push(watchListCollectionsResource)
    const historyResource = api.root.addResource('history')
    resources.push(historyResource)
    const historyStatsResource = historyResource.addResource('stats')
    resources.push(historyStatsResource)
    const historyStatsCollectionIdResource = historyStatsResource.addResource('{collectionId}')
    resources.push(historyStatsCollectionIdResource)
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
    const getWalletCollectionsMethod = walletCollectionsCollections.addMethod(
        'GET',
        new aws_apigateway.LambdaIntegration(getWalletCollectionsLambda, defaultIntegrationOptions),
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

    const moonRanksMethod = moonRanksCollectionResource.addMethod(
        'GET',
        new aws_apigateway.LambdaIntegration(moonRanksLambda, defaultIntegrationOptions), 
        defaultMethodOptions
    )

    const getAvailableTagsMethod = tagsResource.addMethod(
        'GET',
        new aws_apigateway.LambdaIntegration(getAvailableTagsLambda, defaultIntegrationOptions),
        defaultMethodOptions
    )

    const getTargetTagsMethod = targetTagsResource.addMethod(
        'GET',
        new aws_apigateway.LambdaIntegration(getTargetTagsLambda, defaultIntegrationOptions),
        defaultMethodOptions
    )

    const allCollectionsMethod = allCollectionsResource.addMethod(
        'GET',
        new aws_apigateway.LambdaIntegration(getAllCollections, defaultIntegrationOptions),
        defaultMethodOptions
    )
    const getWatchlistCollectionsMethod = watchListCollectionsResource.addMethod(
        'GET',
        new aws_apigateway.LambdaIntegration(getWatchlistCollectionsLambda, defaultIntegrationOptions),
        defaultMethodOptions
    )

    const postWatchListCollectionMethod = watchListResource.addMethod(
        'POST',
        new aws_apigateway.LambdaIntegration(postWatchlistCollectionLambda, defaultIntegrationOptions),
        defaultMethodOptions
    )

    const deleteWatchlistCollectionMethod = watchListResource.addMethod(
        'DELETE',
        new aws_apigateway.LambdaIntegration(deleteWatchlistCollectionLambda, defaultIntegrationOptions),
        defaultMethodOptions
    )

    const historyStatsCollectionIdMethod = historyStatsCollectionIdResource.addMethod(
        'GET',
        new aws_apigateway.LambdaIntegration(getCollectionStatsHistoryLambda, defaultIntegrationOptions),
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