import { Application } from 'express';

import { getAllPokemons } from './controllers/cards';
import { healthCheck } from './controllers/healthCheck';
import { getTodos } from './controllers/todos';
import { getUsers, getUserById, createUser, loginUser } from './controllers/users';
import { validateRegistration, validateLogin } from './middlewares/validation.middleware';

export const init = (app: Application): void => {
  app.get('/health', healthCheck);
  app.get('/users', getUsers);
  app.post('/users', validateRegistration, createUser);
  app.post('/users/login', validateLogin, loginUser);
  app.get('/users/:id', getUserById);
  app.get('/todos', getTodos);
  app.get('/cards', getAllPokemons);
};
