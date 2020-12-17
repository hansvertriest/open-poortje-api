import { Connection } from 'mongoose';
import { ExecSyncOptionsWithBufferEncoding } from 'child_process';

export interface IServerConfig {
    host: string;
    port: number;
    protocol: string;
}

export interface IMongoDBConfig {
    connectionString: string;
}

export interface IAuthConfig {
    secret: string;
    expiresIn: string
    adminPass: string;
    adminUsername: string;
    salt: number;
}

export interface IConfig {
    server: IServerConfig;
    mongoDB: IMongoDBConfig;
    auth: IAuthConfig;
}