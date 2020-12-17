import { default as http, createServer, Server } from 'http';
import { default as express } from 'express';
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
}

export default App;
