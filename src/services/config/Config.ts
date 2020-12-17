const dotenv = require('dotenv');
import { IServerConfig, IConfig, IMongoDBConfig, IAuthConfig } from "./config.types";

class Config implements IConfig {
    public server: IServerConfig;
    public mongoDB: IMongoDBConfig;
    public auth: IAuthConfig;

    constructor() {
        dotenv.config();
        this.loadServerConfig();
        this.loadMongoDBConfig();
        this.loadAuthConfig();
    }

    loadServerConfig(): void {
        this.server = {
            host: process.env.NODE_HOST,
            port: Number(process.env.NODE_PORT),
            protocol: process.env.NODE_PROTOCOL,
        }
    }

    loadMongoDBConfig(): void {
        this.mongoDB = {
            connectionString: process.env.CONN_STRING,
        }
    }

    loadAuthConfig(): void {
        this.auth = {
            secret: process.env.JWT_SECRET,
            expiresIn: process.env.JWT_EXPIRESIN,
            adminPass: process.env.ADMIN_PASS,
            adminUsername: process.env.ADMIN_USERNAME,
            salt: Number(process.env.AUTH_BCRYPT),
        }
    }
}

export default Config;