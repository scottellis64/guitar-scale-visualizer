export interface AwsError extends Error {
    $response?: any;
    name: string;
}