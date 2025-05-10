import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { createSQSClient } from '../factory';
import { AwsConfig, ServiceConfig } from "../types";

export type NotificationParms = {
  queueName: string;
  operationId: string;
  type: string;
  content: any;
}

export class NotificationService {
  private sqsClient;
  private awsConfig: AwsConfig;

  constructor(config: ServiceConfig<any>) {
    this.awsConfig = config.aws;
    this.sqsClient = createSQSClient(config);
  }

  async sendNotification(params: NotificationParms): Promise<void> {
    const { queueName, operationId, type, content } = params;
    
    await this.sqsClient.send(new SendMessageCommand({
      QueueUrl: `${this.awsConfig.endpoint}/queue/${queueName}`,
      MessageBody: JSON.stringify({
        operationId,
        type,
        content
      })
    }));
  }
} 