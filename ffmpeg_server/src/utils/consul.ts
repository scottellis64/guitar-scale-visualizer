import Consul from 'consul';
import { config } from '../config';

const consul = new Consul({
    host: config.consul.host,
    port: config.consul.port.toString()
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

export async function registerService(serviceConfig: ServiceConfig) {
    const serviceId = `${serviceConfig.name}-${config.server.host}`;
    
    try {
        // Use the service name as the address in Docker network
        const serviceAddress = serviceConfig.address || serviceConfig.name;
        
        await consul.agent.service.register({
            id: serviceId,
            name: serviceConfig.name,
            address: serviceAddress,
            port: serviceConfig.port,
            tags: serviceConfig.tags || [],
            check: serviceConfig.check || {
                http: `http://${serviceAddress}:${serviceConfig.port}/health`,
                interval: '10s',
                timeout: '5s',
            },
        });
        
        console.log(`Service ${serviceConfig.name} registered with Consul at ${serviceAddress}:${serviceConfig.port}`);
        
        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            try {
                await consul.agent.service.deregister(serviceId);
                console.log(`Service ${serviceConfig.name} deregistered from Consul`);
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