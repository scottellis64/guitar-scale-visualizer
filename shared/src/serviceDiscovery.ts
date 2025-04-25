import { RegisterInstanceCommand, DiscoverInstancesCommand } from "@aws-sdk/client-servicediscovery";
import { config } from './config';
import { createServiceDiscoveryClient } from './factory';

const client = createServiceDiscoveryClient();

export const registerService = async (serviceName: string) => {
  if (config.environment === 'development') {
    // In development, use Consul
    console.log(`Service ${serviceName} registered with Consul`);
    return;
  }

  try {
    const command = new RegisterInstanceCommand({
      ServiceId: config.aws.serviceId,
      InstanceId: `${serviceName}-${Date.now()}`,
      Attributes: {
        "AWS_INSTANCE_IPV4": config.server.host,
        "AWS_INSTANCE_PORT": config.server.port.toString(),
      },
    });

    await client.send(command);
    console.log(`Service ${serviceName} registered with AWS Cloud Map`);
  } catch (error) {
    console.error('Error registering service:', error);
    throw error;
  }
};

export const discoverService = async (serviceName: string) => {
  if (config.environment === 'development') {
    // In development, use Consul
    return `http://${serviceName}:${config.server.port}`;
  }

  try {
    const command = new DiscoverInstancesCommand({
      NamespaceName: config.aws.namespace,
      ServiceName: serviceName,
      MaxResults: 1,
    });

    const response = await client.send(command);
    const instance = response.Instances?.[0];

    if (!instance) {
      throw new Error(`No instances found for service ${serviceName}`);
    }

    return `http://${serviceName}.${config.aws.namespace}`;
  } catch (error) {
    console.error('Error discovering service:', error);
    throw error;
  }
}; 