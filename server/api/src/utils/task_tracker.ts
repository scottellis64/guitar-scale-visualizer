import { PutItemCommand, GetItemCommand, UpdateItemCommand, AttributeValue } from '@aws-sdk/client-dynamodb';
import { config } from '../config';
import { createDynamoDBClient } from '@fretstop/shared';

// Initialize DynamoDB Client
const getDynamoDbClient = () => createDynamoDBClient(config);

interface TaskStatus {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  type: 'convert' | 'download' | 'extract';
  params: any;
  result?: any;
  error?: string;
  progress?: number;
  output?: any;
  createdAt: string;
  updatedAt: string;
}

function taskToDynamoDBItem(task: TaskStatus): Record<string, AttributeValue> {
  return {
    taskId: { S: task.taskId },
    status: { S: task.status },
    type: { S: task.type },
    params: { S: JSON.stringify(task.params) },
    createdAt: { S: task.createdAt },
    updatedAt: { S: task.updatedAt },
    ...(task.result && { result: { S: JSON.stringify(task.result) } }),
    ...(task.error && { error: { S: task.error } }),
    ...(task.progress && { progress: { N: task.progress.toString() } }),
    ...(task.output && { output: { S: JSON.stringify(task.output) } }),
  };
}

function dynamoDBItemToTask(item: Record<string, AttributeValue>): TaskStatus {
  return {
    taskId: item.taskId.S!,
    status: item.status.S! as TaskStatus['status'],
    type: item.type.S! as TaskStatus['type'],
    params: JSON.parse(item.params.S!),
    createdAt: item.createdAt.S!,
    updatedAt: item.updatedAt.S!,
    ...(item.result && { result: JSON.parse(item.result.S!) }),
    ...(item.error && { error: item.error.S! }),
    ...(item.progress && { progress: Number(item.progress.N!) }),
    ...(item.output && { output: JSON.parse(item.output.S!) }),
  };
}

export async function createTask(taskId: string, type: TaskStatus['type'], params: any): Promise<TaskStatus> {
  const now = new Date().toISOString();
  const task: TaskStatus = {
    taskId,
    status: 'pending',
    type,
    params,
    createdAt: now,
    updatedAt: now,
  };

  await getDynamoDbClient().send(new PutItemCommand({
    TableName: 'ffmpeg-tasks',
    Item: taskToDynamoDBItem(task),
  }));

  return task;
}

export async function getTask(taskId: string): Promise<TaskStatus | null> {
  const { Item } = await getDynamoDbClient().send(new GetItemCommand({
    TableName: 'ffmpeg-tasks',
    Key: { taskId: { S: taskId } },
  }));

  if (!Item) return null;
  return dynamoDBItemToTask(Item);
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus['status'],
  result?: any,
  error?: string
): Promise<void> {
  const updateExpression = [
    'SET #status = :status',
    '#updatedAt = :updatedAt',
  ];

  const expressionAttributeNames: Record<string, string> = {
    '#status': 'status',
    '#updatedAt': 'updatedAt',
  };

  const expressionAttributeValues: Record<string, AttributeValue> = {
    ':status': { S: status },
    ':updatedAt': { S: new Date().toISOString() },
  };

  if (result) {
    updateExpression.push('#result = :result');
    expressionAttributeNames['#result'] = 'result';
    expressionAttributeValues[':result'] = { S: JSON.stringify(result) };
  }

  if (error) {
    updateExpression.push('#error = :error');
    expressionAttributeNames['#error'] = 'error';
    expressionAttributeValues[':error'] = { S: error };
  }

  await getDynamoDbClient().send(new UpdateItemCommand({
    TableName: 'ffmpeg-tasks',
    Key: { taskId: { S: taskId } },
    UpdateExpression: updateExpression.join(', '),
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  }));
} 