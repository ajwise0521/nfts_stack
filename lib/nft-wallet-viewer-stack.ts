import { 
  Stack,
  StackProps,
  aws_ec2
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { getWalletViewerApi } from './Apis/walletViewerApi';
import { getNftsDatabase } from './Database/NFtsDatabase';
  

  export class NftWalletViewerStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
      
      const vpc = getVpc(this)

        const walletViewerApi = getWalletViewerApi(this, vpc)

        const nftsDatabase = getNftsDatabase(this, vpc)

    }
  }

  export const getVpc = (construct: Construct): aws_ec2.IVpc => {
    const vpc = new aws_ec2.Vpc(construct,
      'nftsVPC',
      {
          cidr: '10.0.0.0/16',
          natGateways: 0,
          maxAzs: 3,

      }
    )
    return vpc
  }