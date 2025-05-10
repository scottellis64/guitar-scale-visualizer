import * as dynamoose from 'dynamoose';
import { v4 as uuidv4 } from 'uuid';
import { TABLES } from '../config';

interface IUser {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

// User Schema
const UserSchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true,
    required: true
  },
  username: {
    type: String,
    required: true,
    index: {
      name: "usernameIndex",
      type: "global"
    }
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create the model
export const User = dynamoose.model(TABLES.USERS, UserSchema, {
  create: true,
  waitForActive: true
});

export interface UserData {
    id: string;
    username: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export async function createUser(userData: { username: string; email: string; password: string }) {
    const user = await User.create({
        id: uuidv4(),
        ...userData
    });
    return user.id;
}

export async function getUserByUsername(username: string) {
    const users = await User.scan('username').eq(username).exec();
    if (users.count === 0) return null;
    
    const { password, ...userData } = users[0].toJSON();
    return userData;
}

export async function getUser(id: string) {
    const user = await User.get(id);
    if (!user) return null;
    
    const { password, ...userData } = user.toJSON();
    return userData;
}

export async function listUsers() {
    const users = await User.scan().exec();
    return users.map(user => {
        const { password, ...userData } = user.toJSON();
        return userData;
    });
} 