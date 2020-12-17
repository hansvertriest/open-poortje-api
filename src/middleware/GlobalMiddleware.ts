import * as bodyParser from 'body-parser';

class GlobalMiddleware {
    public static load(app) {
        app.use(bodyParser.json({ limit: '50mb' }))
    }

}

export default GlobalMiddleware;