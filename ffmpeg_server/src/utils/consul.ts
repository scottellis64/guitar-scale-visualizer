import Consul from 'consul';
import dotenv from 'dotenv';

dotenv.config();

const consul = new Consul({
    host: process.env.CONSUL_HOST || 'consul',
    port: process.env.CONSUL_PORT || '8500'
});

export interface ServiceConfig {
    name: string;
    port: number;
    address?: string;
    tags?: string[];
    check?: {
        http: string;
        interval: string;
        timeout: string;
    };
}

interface ConsulService {
    Service: string;
    Address: string;
    Port: number;
}

export async function registerService(config: ServiceConfig) {
    const serviceId = `${config.name}-${process.env.HOSTNAME || 'local'}`;
    
    try {
        // Use the service name as the address in Docker network
        const serviceAddress = config.address || config.name;
        
        await consul.agent.service.register({
            id: serviceId,
            name: config.name,
            address: serviceAddress,
            port: config.port,
            tags: config.tags || [],
            check: config.check || {
                http: `http://${serviceAddress}:${config.port}/health`,
                interval: '10s',
                timeout: '5s',
            },
        });
        
        console.log(`Service ${config.name} registered with Consul at ${serviceAddress}:${config.port}`);
        
        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            try {
                await consul.agent.service.deregister(serviceId);
                console.log(`Service ${config.name} deregistered from Consul`);
                process.exit(0);
            } catch (error) {
                console.error('Error during service deregistration:', error);
                process.exit(1);
            }
        });
    } catch (error) {
        console.error('Error registering service with Consul:', error);
    }
}

export async function discoverService(serviceName: string) {
    try {
        const services = await consul.agent.service.list() as Record<string, ConsulService>;
        const service = Object.values(services).find(s => s.Service === serviceName);
        
        if (!service) {
            throw new Error(`Service ${serviceName} not found in Consul`);
        }
        
        return {
            address: service.Address,
            port: service.Port,
        };
    } catch (error) {
        console.error('Error discovering service:', error);
        throw error;
    }
} 