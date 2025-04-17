import { ServiceDiscoveryClient, RegisterInstanceCommand } from "@aws-sdk/client-servicediscovery";
import { config } from "dotenv";

config();

const serviceDiscovery = new ServiceDiscoveryClient({
  region: process.env.AWS_REGION || "us-east-1",
});

export async function registerService(serviceName: string, port: number) {
  if (process.env.NODE_ENV === "development") {
    // In development, use Consul
    console.log(`Service ${serviceName} registered with Consul`);
    return;
  }

  try {
    const command = new RegisterInstanceCommand({
      ServiceId: process.env.AWS_SERVICE_ID,
      InstanceId: `${serviceName}-${Date.now()}`,
      Attributes: {
        "AWS_INSTANCE_IPV4": process.env.HOST_IP || "localhost",
        "AWS_INSTANCE_PORT": port.toString(),
      },
    });

    await serviceDiscovery.send(command);
    console.log(`Service ${serviceName} registered with AWS Cloud Map`);
  } catch (error) {
    console.error("Error registering service:", error);
  }
}

export async function discoverService(serviceName: string) {
  if (process.env.NODE_ENV === "development") {
    // In development, use Consul
    return `http://${serviceName}:3000`;
  }

  // In production, use AWS Cloud Map
  // Implementation would depend on your specific AWS setup
  return `http://${serviceName}.${process.env.AWS_NAMESPACE}`;
} 