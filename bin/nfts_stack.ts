#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NftsStackStack } from '../lib/nfts_stack-stack';
import { NftWalletViewerStack } from '../lib/nft-wallet-viewer-stack'

const app = new cdk.App();
new NftsStackStack(app, 'NftsStackStack', {});
new NftWalletViewerStack(app, 'NftWalletViewerStack', {
  stackName: 'NftWalletViewerStack-Prod',
  env: {
    account: '222439617721',
    region: 'us-east-1'
  }
})

new NftWalletViewerStack(app, 'NftWalletViewerStack-Stage', {
  stackName: 'NftWalletViewerStack-Stage',
  env: {
    account: '222439617721',
    region: 'us-east-1'
  }
})