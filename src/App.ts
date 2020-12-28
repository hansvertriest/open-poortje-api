import { default as http, createServer, Server } from 'http';
import { default as express } from 'express';
import { default as cron } from 'cron';
import { default as fetch } from 'node-fetch';
import { Config, IConfig } from './services';
import Router from './Router';
import { GlobalMiddleware } from './middleware';

class App {
  public app: express.Application;
  public server: Server;
  public config: IConfig;
  public router: Router;

  constructor(config: IConfig) {
    this.config = config;

    this.createExpress();
    this.createServer();
    this.createRouter();
  }

  private createExpress() {
    this.app = express();
    GlobalMiddleware.load(this.app)
  }

  private createServer() {
    this.server = createServer(this.app);
    this.server.on('error', (error?: Error) => {
      this.gracefulShutdown(error);
    });
    this.server.on('close', () => {
      console.log('Server is closed!', {});
    });
    this.server.on('listening', () => {
      this.KeepAlive();
      console.log('server started at http://localhost:'+this.config.server.port);
    });
  }

  private createRouter(): void {
    this.router = new Router(this.app, this.config);
  }

  public start(): void {
    this.server.listen(this.config.server.port);
  }

  public stop(): void {
    this.server.close((error?: Error) => {
      this.gracefulShutdown(error);
    });
  }

  private gracefulShutdown(error?: Error): void {
    console.log('Server gracefully shutdown');

    if (error) {
      process.exit(1);
    }
    process.exit();
  }

  private KeepAlive(): void {
    const url = `https://duck-away-api.herokuapp.com/ducks`;
    
    (() => {


      const cronJob = new cron.CronJob('0 */25 * * * *', () => {

        fetch(url)
          .then(res => console.log(`response-ok: ${res.ok}, status: ${res.status}`))
          .catch(err => console.log(`KeepAlive has failed`));

      });

      cronJob.start();
    })();
  }
}

export default App;
