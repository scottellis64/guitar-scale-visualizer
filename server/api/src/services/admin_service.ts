import { 
    listUsers, getUser, createUser, UserData, listMedia, getMedia, deleteMedia,
    getVideoUserAssociations, createVideoUserAssociation, deleteVideoUserAssociation,
    getOperation, createOperation, updateOperationStatus, listOperations, deleteOperation
} from '../db';

export class AdminService {
    private static instance: AdminService;

    private constructor() {}

    public static getInstance(): AdminService {
        if (!AdminService.instance) {
            AdminService.instance = new AdminService();
        }
        return AdminService.instance;
    }

    // User Management
    public async listUsers(): Promise<UserData[]> {
        return listUsers() as Promise<UserData[]>;
    }

    public async getUser(id: string): Promise<UserData | null> {
        return getUser(id) as Promise<UserData | null>;
    }

    public async createUser(userData: { username: string; email: string; password: string }): Promise<string> {
        return createUser(userData);
    }

    // Media Management
    public async listMedia(bucket: string, userId?: string): Promise<any[]> {
        return listMedia(bucket, userId);
    }

    public async getMedia(id: string, bucket: string): Promise<{ metadata: any; url: string }> {
        return getMedia(id, bucket);
    }

    public async deleteMedia(id: string, bucket: string): Promise<void> {
        return deleteMedia(id, bucket);
    }

    // Video User Associations Management
    public async listVideoUserAssociations(userId: string): Promise<any[]> {
        return getVideoUserAssociations(userId);
    }

    public async createVideoUserAssociation(videoId: string, userId: string, metadata: any = {}): Promise<string> {
        return createVideoUserAssociation(videoId, userId, metadata);
    }

    public async deleteVideoUserAssociation(userId: string, videoId: string): Promise<void> {
        return deleteVideoUserAssociation(userId, videoId);
    }

    // Operations Management
    public async getOperation(id: string): Promise<any> {
        return getOperation(id);
    }

    public async listOperations(): Promise<any[]> {
        return listOperations();
    }

    public async createOperation(userId: string, type: string, metadata: any = {}): Promise<string> {
        return createOperation(userId, type, metadata);
    }

    public async updateOperationStatus(id: string, status: string, metadata: any = {}): Promise<any> {
        return updateOperationStatus(id, status, metadata);
    }

    public async deleteOperation(id: string): Promise<void> {
        return deleteOperation(id);
    }
} 