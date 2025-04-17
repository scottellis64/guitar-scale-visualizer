import { getServiceUrl } from '../utils/consul';

export interface Environment {
    apiUrl: string;
    ffmpegUrl: string;
    isDevelopment: boolean;
}

let env: Environment | null = null;

export async function getEnvironment(): Promise<Environment> {
    if (env) return env;

    const isDevelopment = import.meta.env.DEV;
    
    if (isDevelopment) {
        // In development, use direct URLs
        env = {
            apiUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
            ffmpegUrl: import.meta.env.VITE_FFMPEG_BASE_URL || 'http://localhost:3001',
            isDevelopment,
        };
    } else {
        // In production, use Consul for service discovery
        try {
            const apiUrl = await getServiceUrl('server');
            const ffmpegUrl = await getServiceUrl('ffmpeg_server');
            
            env = {
                apiUrl,
                ffmpegUrl,
                isDevelopment,
            };
        } catch (error) {
            console.error('Error discovering services:', error);
            // Fallback to direct URLs if Consul fails
            env = {
                apiUrl: import.meta.env.VITE_API_BASE_URL || 'http://server:3000',
                ffmpegUrl: import.meta.env.VITE_FFMPEG_BASE_URL ||  'http://ffmpeg_server:3001',
                isDevelopment,
            };
        }
    }
    
    return env;
} 