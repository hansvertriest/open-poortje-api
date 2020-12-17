import { Application } from 'express';
import * as bodyParser from 'body-parser';

class GlobalMiddleware {
    public static load(app: Application) {
        app.use(bodyParser.json({ limit: '50mb' }))
    }

}

export default GlobalMiddleware;