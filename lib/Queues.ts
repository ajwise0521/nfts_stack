import { aws_sqs, Duration} from 'aws-cdk-lib'

import {Construct} from 'constructs';


export const createCollectionMessagesQueue = (stack: Construct): aws_sqs.Queue => {
  const queue = new aws_sqs.Queue(stack, 'createCollectionMessages.fifo', {
      queueName: "createCollectionMessages-queue.fifo",
      deliveryDelay: Duration.minutes(0),
      contentBasedDeduplication: true,
      visibilityTimeout: Duration.seconds(60),
      retentionPeriod: Duration.days(7),
      fifo: true,
    })

    return queue
}