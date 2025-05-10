import * as dynamoose from 'dynamoose';
import { v4 as uuidv4 } from 'uuid';
import { OPERATION_STATUS } from '../utils';
import { TABLES } from '../config';

interface IOperation {
  id: string;
  userId: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

// Operation Schema
const OperationSchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true,
    required: true
  },
  userId: {
    type: String,
    required: true,
    index: {
      name: "userIdIndex",
      type: "global"
    }
  },
  type: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(OPERATION_STATUS)
  }
}, {
  timestamps: true
});

// Create the model
const Operation = dynamoose.model(TABLES.OPERATIONS, OperationSchema, {
  create: true,
  waitForActive: true
});

export async function createOperation(userId: string, type: string, metadata: any = {}) {
  const operation = await Operation.create({
    id: uuidv4(),
    userId,
    type,
    status: OPERATION_STATUS.PENDING,
    ...metadata
  });
  return operation.id;
}

export async function updateOperationStatus(id: string, status: string, metadata: any = {}) {
  const operation = await Operation.update({
    id,
    status,
    ...metadata
  });
  return operation;
}

export async function getOperation(id: string) {
  return await Operation.get(id);
}

export async function listOperations() {
  const operations = await Operation.scan().exec();
  return operations.map(op => op.toJSON());
}

export async function deleteOperation(id: string) {
  await Operation.delete(id);
} 