import App from './App';
import { Config, IConfig, MongoDB, GridFs } from './services';

(async () => {
    // create config service
    const config: IConfig = new Config();

    try {
        // create MongoDB service
        const mongoDB = new MongoDB(config);
        await mongoDB.connect(); 

        // init gridFs stream
        GridFs.initStream();
    
        // create application
        const app: App = new App(config);
        app.start();
    
        // Stop all running processes
        const stopAllProcesses = async () => {
            app.stop();
    
            console.log('All processes were terminated')
        };
      
        process.on('SIGINT', () => stopAllProcesses());
        process.on('SIGTERM', () => stopAllProcesses());
    } catch (error) {
        console.log(error);
    }
})();