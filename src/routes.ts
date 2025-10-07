import { Application } from 'express';

import { getAllPokemons } from './controllers/cards';
import { healthCheck } from './controllers/healthCheck';
import { getTodos } from './controllers/todos';
import { getUsers, getUserById, createUser } from './controllers/users';
import { validateRegistration } from './middlewares/validateUser.middleware';

export const init = (app: Application): void => {
  app.get('/health', healthCheck);
  app.get('/users', getUsers);
  app.post('/users', validateRegistration, createUser);
  app.get('/users/:id', getUserById);
  app.get('/todos', getTodos);
  app.get('/cards', getAllPokemons);
};
