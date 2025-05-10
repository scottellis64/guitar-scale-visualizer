import { ServiceConfig, S3Config } from '../types';

export const getS3Config = (config: ServiceConfig<any>, bucketName: string): S3Config | undefined => {
  return config.s3?.find((s3: S3Config) => s3.bucketName === bucketName);
};