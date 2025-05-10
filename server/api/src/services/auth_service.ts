import { createUser, getUserByUsername, listUsers, UserData } from '../db';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import bcrypt from 'bcryptjs';

export class AuthorizationService {
    private static instance: AuthorizationService;

    private constructor() {}

    public static getInstance(): AuthorizationService {
        if (!AuthorizationService.instance) {
            AuthorizationService.instance = new AuthorizationService();
        }
        return AuthorizationService.instance;
    }

    public async register(username: string, email: string, password: string): Promise<{ id: string; token: string }> {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user in DynamoDB
        const id = await createUser({
            username,
            email,
            password: hashedPassword
        });

        // Generate JWT token
        const token = this.generateToken(id);

        return { id, token };
    }

    public async login(username: string, password: string): Promise<{ id: string; token: string } | null> {
        // Get user from DynamoDB
        const user = await getUserByUsername(username);
        
        if (!user) {
            return null;
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return null;
        }

        // Generate JWT token
        const token = this.generateToken(user.id);

        return { id: user.id, token };
    }

    public async listUsers(): Promise<UserData[]> {
        return listUsers() as Promise<UserData[]>;
    }

    private generateToken(userId: string): string {
        return jwt.sign(
            { userId },
            config.service.config.jwt.secret,
            { expiresIn: '24h' }
        );
    }
} 