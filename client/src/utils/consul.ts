import Consul from 'consul';

const consul = new Consul({
    host: import.meta.env.VITE_CONSUL_HOST || 'consul',
    port: import.meta.env.VITE_CONSUL_PORT ? parseInt(import.meta.env.VITE_CONSUL_PORT) : 8500
});

export interface ServiceInfo {
    address: string;
    port: number;
}

export async function discoverService(serviceName: string): Promise<ServiceInfo> {
    try {
        const services = await consul.agent.service.list();
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

export async function getServiceUrl(serviceName: string): Promise<string> {
    const service = await discoverService(serviceName);
    return `http://${service.address}:${service.port}`;
} 