import Consul from 'consul';
import { config } from '../config';

export const createConsulClient = () => {
  return new Consul({
    host: config.consul.host,
    port: config.consul.port.toString()
  });
}; 