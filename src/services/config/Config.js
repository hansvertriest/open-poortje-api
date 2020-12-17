"use strict";
exports.__esModule = true;
var dotenv = require('dotenv');
var Config = /** @class */ (function () {
    function Config() {
        dotenv.config();
        this.loadServerConfig();
        this.loadMongoDBConfig();
        this.loadAuthConfig();
    }
    Config.prototype.loadServerConfig = function () {
        this.server = {
            host: process.env.NODE_HOST,
            port: Number(process.env.NODE_PORT),
            protocol: process.env.NODE_PROTOCOL
        };
    };
    Config.prototype.loadMongoDBConfig = function () {
        this.mongoDB = {
            connectionString: process.env.CONN_STRING
        };
    };
    Config.prototype.loadAuthConfig = function () {
        this.auth = {
            secret: process.env.JWT_SECRET,
            expiresIn: process.env.JWT_EXPIRESIN,
            adminPass: process.env.ADMIN_PASS,
            adminUsername: process.env.ADMIN_USERNAME,
            salt: Number(process.env.AUTH_BCRYPT)
        };
    };
    return Config;
}());
exports["default"] = Config;
