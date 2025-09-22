import app from './app';
import config from './config/config';
import { AppDataSource } from './data-source';

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
    app.listen(config.api.port, () => {
      console.log(`Server running on http://localhost:${config.api.port}`);
    });
  })
  .catch((error) => {
    console.error('Error during Data Source initialization', error);
  });
