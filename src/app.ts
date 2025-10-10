import express from 'express';

import { setupMiddlewares } from './config/middleware.config';
import { errorHandlerMiddleware } from './middlewares/error.middleware';
import * as routes from './routes';

const createApp = () => {
  const app = express();

  setupMiddlewares(app);

  routes.init(app);

  app.use(errorHandlerMiddleware);

  return app;
};

export default createApp();
