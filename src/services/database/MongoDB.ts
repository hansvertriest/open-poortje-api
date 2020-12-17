import { default as mongoose } from 'mongoose';
import { Connection } from 'mongoose';

import { IConfig } from '../config';

class MongoDB {
    public config: IConfig;

    constructor(config: IConfig) {
        this.config = config;
    }

    public connect() : Promise<Connection> {
        return new Promise((resolve, reject) => {
            mongoose.connect( this.config.mongoDB.connectionString,{
                useNewUrlParser: true,
                useUnifiedTopology: true
              })
              .then((data) => {
                const db: Connection = mongoose.connection;
                console.log('Connected to mongoDB');
                resolve(db);
              })
              .catch((error) => {
                const db: Connection = mongoose.connection;
                console.log('MongoDB error:', error);
                reject(db)
              });
        });
    }
} 

export default MongoDB;