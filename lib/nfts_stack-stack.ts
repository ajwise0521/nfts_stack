import { 
  Stack,
  StackProps,
  aws_lambda_nodejs as lambda,
  Duration,
  aws_sqs,
  aws_lambda_event_sources,
  aws_events,
  aws_events_targets
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { TableAccessGrantee, TableNames, Tables } from './Tables';
import { grantTableAccess } from './buildTableAccess';
import * as Queues from './Queues'


export class NftsStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const createCollectionSalesBotMessagesQueue: aws_sqs.Queue = Queues.createCollectionMessagesQueue(this)


    const createCollectionMessagesLambda: lambda.NodejsFunction = new lambda.NodejsFunction(this, 'CreateCollectionMessages', {
      entry: 'lambda/createCollectionSalesBotMessages.ts',
      handler: 'handle', 
      timeout: Duration.seconds(15),
      memorySize: 256,
      environment: {SALES_BOT_QUEUE_URL: createCollectionSalesBotMessagesQueue.queueUrl}
    })

    const salesBotLambda: lambda.NodejsFunction = new lambda.NodejsFunction(this, 'SalesBot', {
      entry: 'lambda/salesBot.ts',
      handler: 'runSalesBot',
      timeout: Duration.minutes(5),
      memorySize: 256,
      environment: {}
    })

    // allowing the sendOrderToCargotel lambda to consume and producde messages to/from the queue
    createCollectionSalesBotMessagesQueue.grantConsumeMessages(salesBotLambda)
    createCollectionSalesBotMessagesQueue.grantSendMessages(createCollectionMessagesLambda)


    const eventRule = new aws_events.Rule(this, 'scheduleRule', {
      schedule: aws_events.Schedule.rate(Duration.minutes(3))
  })

  eventRule.addTarget(new aws_events_targets.LambdaFunction(createCollectionMessagesLambda))

salesBotLambda.addEventSource(new aws_lambda_event_sources.SqsEventSource(createCollectionSalesBotMessagesQueue))

  const tableAccessGrantees: TableAccessGrantee[] = []
  tableAccessGrantees.push(grantTableAccess(createCollectionMessagesLambda, TableNames.CollectionConfiguration, true, true))
  tableAccessGrantees.push(grantTableAccess(salesBotLambda, TableNames.CollectionConfiguration, true, true))
  new Tables(this, 'Tables', tableAccessGrantees, props)

  }
}
