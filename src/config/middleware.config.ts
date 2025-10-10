import cors from 'cors';
import express, { Application } from 'express';

import { setupSwagger } from './swagger.config';

export const setupMiddlewares = (app: Application): void => {
  app.use(cors());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const swaggerMiddleware = setupSwagger();
  if (swaggerMiddleware.length > 0) {
    app.use('/docs', ...swaggerMiddleware);
  }
};
