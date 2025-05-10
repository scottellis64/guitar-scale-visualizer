import { SQSClient } from '@aws-sdk/client-sqs';
import { ServiceDiscoveryClient } from '@aws-sdk/client-servicediscovery';
import { S3Client } from '@aws-sdk/client-s3';
import { AwsConfig, ServiceConfig } from '../types';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export class AwsFactory {
    private static instance: AwsFactory;
    private s3Client: S3Client | null = null;
    private sqsClient: SQSClient | null = null;
    private serviceDiscoveryClient: ServiceDiscoveryClient | null = null;
    private dynamoDBClient: DynamoDBClient | null = null;
    private dynamoDBDocumentClient: DynamoDBDocumentClient | null = null;

    private constructor() {}

    public static getInstance(): AwsFactory {
        if (!AwsFactory.instance) {
            AwsFactory.instance = new AwsFactory();
        }
        return AwsFactory.instance;
    }

    // Base AWS configuration
    private getBaseAwsConfig(serviceConfig: ServiceConfig<any>) {
        return {
            region: serviceConfig.aws.region,
            ...(serviceConfig.environment === 'development' && {
                credentials: {
                    accessKeyId: serviceConfig.aws.credentials.accessKeyId,
                    secretAccessKey: serviceConfig.aws.credentials.secretAccessKey,
                },
                forcePathStyle: true,
                maxAttempts: 3,
            }),
        };
    }

    public createS3Client(awsConfig: AwsConfig): S3Client {
        if (this.s3Client) {
            return this.s3Client;
        }

        this.s3Client = new S3Client({
            region: awsConfig.region,
            endpoint: awsConfig.endpoint,
            credentials: awsConfig.credentials,
            forcePathStyle: true
        });

        return this.s3Client;
    }

    public createSQSClient(serviceConfig: ServiceConfig<any>): SQSClient {
        if (this.sqsClient) {
            return this.sqsClient;
        }

        const clientConfig = {
            ...this.getBaseAwsConfig(serviceConfig),
            ...(serviceConfig.environment === 'development' && {
                endpoint: serviceConfig.aws.endpoint,
                tls: false,
                forcePathStyle: true,
                region: serviceConfig.aws.region,
                credentials: serviceConfig.aws.credentials,
                requestHandler: {
                    // Remove timeout settings to allow for indefinite waiting
                },
                useQueueUrlAsEndpoint: false
            }),
        };

        console.log('Creating SQS client with config:', {
            ...clientConfig,
            credentials: clientConfig.credentials ? '***' : undefined
        });

        this.sqsClient = new SQSClient(clientConfig);
        return this.sqsClient;
    }

    public createServiceDiscoveryClient(serviceConfig: ServiceConfig<any>): ServiceDiscoveryClient {
        if (this.serviceDiscoveryClient) {
            return this.serviceDiscoveryClient;
        }

        this.serviceDiscoveryClient = new ServiceDiscoveryClient({
            ...this.getBaseAwsConfig(serviceConfig),
            ...(serviceConfig.environment === 'development' && {
                endpoint: serviceConfig.aws.endpoint,
                tls: false,
                forcePathStyle: true,
                region: serviceConfig.aws.region,
                credentials: serviceConfig.aws.credentials
            }),
        });

        return this.serviceDiscoveryClient;
    }

    public createDynamoDBClient(serviceConfig: ServiceConfig<any>): DynamoDBClient {
        if (this.dynamoDBClient) {
            return this.dynamoDBClient;
        }

        this.dynamoDBClient = new DynamoDBClient({
            ...this.getBaseAwsConfig(serviceConfig),
            ...(serviceConfig.environment === 'development' && {
                endpoint: serviceConfig.aws.endpoint,
                tls: false,
            }),
        });

        return this.dynamoDBClient;
    }

    public createDynamoDBDocumentClient(serviceConfig: ServiceConfig<any>): DynamoDBDocumentClient {
        if (this.dynamoDBDocumentClient) {
            return this.dynamoDBDocumentClient;
        }

        this.dynamoDBDocumentClient = DynamoDBDocumentClient.from(this.createDynamoDBClient(serviceConfig));
        return this.dynamoDBDocumentClient;
    }
}

// Export factory functions that use the singleton instance
export const createS3Client = (awsConfig: AwsConfig): S3Client => {
    return AwsFactory.getInstance().createS3Client(awsConfig);
};

export const createSQSClient = (serviceConfig: ServiceConfig<any>): SQSClient => {
    return AwsFactory.getInstance().createSQSClient(serviceConfig);
};

export const createServiceDiscoveryClient = (serviceConfig: ServiceConfig<any>): ServiceDiscoveryClient => {
    return AwsFactory.getInstance().createServiceDiscoveryClient(serviceConfig);
};

export const createDynamoDBClient = (serviceConfig: ServiceConfig<any>): DynamoDBClient => {
    return AwsFactory.getInstance().createDynamoDBClient(serviceConfig);
};

export const createDynamoDBDocumentClient = (serviceConfig: ServiceConfig<any>): DynamoDBDocumentClient => {
    return AwsFactory.getInstance().createDynamoDBDocumentClient(serviceConfig);
};