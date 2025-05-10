import Consul from 'consul';
import { ConsulConfig } from '../types';

export const createConsulClient = (config: ConsulConfig): Consul => {
    return new Consul({
        host: config.host,
        port: config.port
    });
};