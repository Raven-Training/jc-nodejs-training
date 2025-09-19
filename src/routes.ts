import { Application } from 'express';

import { healthCheck } from './controllers/healthCheck';
import { getTodos } from './controllers/todos';
import { getUsers, getUserById, createUser } from './controllers/users';

export const init = (app: Application): void => {
  app.get('/health', healthCheck);
  app.get('/users', getUsers);
  app.post('/users', createUser);
  app.get('/users/:id', getUserById);
  app.get('/todos', getTodos);
};
