import Consul from 'consul';

import { ConsulConfig } from '../types';
import { createConsulClient } from '../factory';
import { RegisterOptions } from 'consul/lib/agent/service';

interface ConsulService {
    Service: string;
    Address: string;
    Port: number;
}

let consul: Consul;

export async function initializeConsul(consulConfig: ConsulConfig) {
    if (!consul) {
        consul = createConsulClient(consulConfig);
    }
}

export async function registerConsulService(consulConfig: ConsulConfig) {
    const serviceId = `${consulConfig.name}-${consulConfig.host}`;

    try {
        // Use the service name as the address in Docker network
        const serviceAddress = consulConfig.address || consulConfig.name;
        
        const consulOptions: RegisterOptions = {
            id: serviceId,
            name: consulConfig.name,
            address: serviceAddress,
            port: consulConfig.port,
            tags: consulConfig.tags || [],
        };

        await consul.agent.service.register(consulOptions);
        
        console.log(`Service ${consulConfig.name} registered with Consul at ${serviceAddress}:${consulConfig.port}`);
        
        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            try {
                await consul.agent.service.deregister(serviceId);
                console.log(`Service ${consulConfig.name} deregistered from Consul`);
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

export async function discoverService(consulConfig: ConsulConfig, serviceName: string) {
    try {
        await initializeConsul(consulConfig);

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