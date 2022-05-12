import {
    aws_ec2,
    aws_lambda_nodejs as lambda,
    Duration
} from 'aws-cdk-lib'
import { SecurityGroup } from 'aws-cdk-lib/aws-ec2'
import { Construct } from 'constructs'
import { getVpc } from '../nft-wallet-viewer-stack'
import { environment } from '../../environment'
import { memoryUsage } from 'process'


export const getWalletContents = (construct: Construct): lambda.NodejsFunction => {
    return new lambda.NodejsFunction(construct, 'getWalletContents', {
        entry: 'lambda/handlers/getWalletContents.ts',
        handler: 'handle', 
        timeout: Duration.seconds(60),
        memorySize: 256,
    })
}

export const getWalletCollections = (construct: Construct): lambda.NodejsFunction => {
    return  new lambda.NodejsFunction(construct, 'getWalletCollections', {
        entry: 'lambda/handlers/getWalletCollections.ts',
        handler: 'handle',
        timeout: Duration.seconds(60),
        memorySize: 265,
    })
}

export const getMECollectionStats = (construct: Construct): lambda.NodejsFunction => {
    return new lambda.NodejsFunction(construct, 'getMECollectionStats', {
        entry: 'lambda/handlers/getMagicEdenCollectionStats.ts',
        handler: 'handle',
        timeout: Duration.seconds(30),
        memorySize: 256,
        environment: {
            ...environment.magicEden
        }
    })
}

export const getHowRareCollectionRanks = (construct: Construct): lambda.NodejsFunction => {
    return new lambda.NodejsFunction(construct, 'getHowRareCollectionRanks', {
        entry: 'lambda/handlers/getCollectionHowRareRanks.ts',
        handler: 'handle',
        timeout: Duration.seconds(30),
        memorySize: 256,
        environment: {
            ...environment.howRare
        }
    })
}

export const getCollectionRecentSales = (construct: Construct): lambda.NodejsFunction => {
    return new lambda.NodejsFunction(construct, 'getCollectionRecentSales', {
        entry: 'lambda/handlers/getCollectionRecentSales.ts',
        handler: 'handle',
        timeout: Duration.seconds(30),
        memorySize: 256,
        environment: {
            ...environment.magicEden
        }
    })
}

export const getVerifiedCollectionSales = (construct: Construct): lambda.NodejsFunction => {
    return new lambda.NodejsFunction(construct, 'getVerifiedCollections', {
        entry: 'lambda/handlers/getVerifiedCollections.ts',
        handler: 'handle',
        timeout: Duration.seconds(30),
        memorySize: 256,
    })
}

export const postSuggestion = (construct: Construct): lambda.NodejsFunction => {
    return new lambda.NodejsFunction(construct, 'postSuggestion', {
        entry: 'lambda/handlers/postSuggestion.ts',
        handler: 'handle',
        timeout: Duration.seconds(30),
        memorySize: 256
    })
}

export const getMoonRankCollectionRanks = (construct: Construct): lambda.NodejsFunction => {
    return new lambda.NodejsFunction(construct, 'moonRankCollectionRanks', {
        entry: 'lambda/handlers/getCollectionMoonRanks.ts',
        handler: 'handle',
        timeout: Duration.seconds(30),
        memorySize: 256,
        environment: {
            ...environment.moonRank
        }
    })
}

export const getAvailableTags = (construct: Construct): lambda.NodejsFunction => {
    return new lambda.NodejsFunction(construct, 'getAvailableTags', {
        entry: 'lambda/handlers/getAvailableTags.ts',
        handler: 'handle',
        timeout: Duration.seconds(30),
        memorySize: 256,
    })
}

export const getTargetTags = (construct: Construct): lambda.NodejsFunction => {
    return new lambda.NodejsFunction(construct, 'getTargetTags', {
        entry: 'lambda/handlers/getTargetTags.ts',
        handler: 'handle',
        timeout: Duration.seconds(30),
        memorySize: 256
    })
}

export const getAllCollections = (construct: Construct): lambda.NodejsFunction => {
    return new lambda.NodejsFunction(construct, 'getAllCollections', {
        entry: 'lambda/handlers/getAllCollections.ts',
        handler: 'handle',
        timeout: Duration.seconds(30),
        memorySize: 256
    })
}

export const getWatchlistCollections = (construct: Construct): lambda.NodejsFunction => {
    return new lambda.NodejsFunction(construct, 'getWatchlistCollections', {
        entry: 'lambda/handlers/getWatchlistCollections.ts',
        handler: 'handle',
        timeout: Duration.seconds(30),
        memorySize: 256
    })
}

export const postWatchlistCollection = (construct: Construct): lambda.NodejsFunction => {
    return new lambda.NodejsFunction(construct, 'postWatchlistCollection', {
        entry: 'lambda/handlers/postWatchlistCollection.ts',
        handler: 'handle',
        timeout: Duration.seconds(30),
        memorySize: 256
    })
}

export const deleteWatchlistCollection = (construct: Construct): lambda.NodejsFunction => {
    return new lambda.NodejsFunction(construct, 'deleteWatchlistCollection', {
        entry: 'lambda/handlers/deleteWatchlistCollection.ts',
        handler: 'handle',
        timeout: Duration.seconds(30),
        memorySize: 256
    })
}