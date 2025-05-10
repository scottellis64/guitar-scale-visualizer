import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import * as dynamoose from 'dynamoose';

import { createDynamoDBDocumentClient, createDynamoDBClient } from '@fretstop/shared';
import { config, TABLES } from '../config';

export class DBManagerService {
  private ddbDocClient: DynamoDBDocumentClient;
  private dynamoDBClient: DynamoDBClient;
  private static instance: DBManagerService;

  private constructor() {
    this.ddbDocClient = createDynamoDBDocumentClient(config);
    this.dynamoDBClient = createDynamoDBClient(config);
  }

  public static getInstance() {
    if (!DBManagerService.instance) {
      DBManagerService.instance = new DBManagerService();
    }
    return DBManagerService.instance;
  }

  public async init() {
    this.initSchema();
    await this.createTables();
  }

  private initSchema() {
    dynamoose.aws.ddb.local();

    // Set AWS credentials
    const ddb = new dynamoose.aws.ddb.DynamoDB({
      credentials: config.aws.credentials,
      region: config.aws.region
    });

    dynamoose.aws.ddb.set(ddb);
  }

  private async createTables() {
    for (const tableName of Object.values(TABLES)) {
      try {
        const params: any = {
          TableName: tableName,
          KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' }
          ],
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        };

        // Add GSI for VIDEO_USER_ASSOCIATIONS table
        if (tableName === TABLES.VIDEO_USER_ASSOCIATIONS) {
          params.AttributeDefinitions.push({ AttributeName: 'userId', AttributeType: 'S' });
          params.GlobalSecondaryIndexes = [{
            IndexName: 'UserIdIndex',
            KeySchema: [
              { AttributeName: 'userId', KeyType: 'HASH' }
            ],
            Projection: {
              ProjectionType: 'ALL'
            },
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5
            }
          }];
        }

        await this.dynamoDBClient.send(new CreateTableCommand(params));
        console.log(`Created DynamoDB table: ${tableName}`);
      } catch (error: any) {
        if (error.name === 'ResourceInUseException') {
          console.log(`Table ${tableName} already exists`);
        } else {
          console.error('Error creating table:', error);
          throw error;
        }
      }
    }
  }

  public getDDBDocClient() {
    return this.ddbDocClient;
  }

  public getDynamoDBClient() {
    return this.dynamoDBClient;
  }
}