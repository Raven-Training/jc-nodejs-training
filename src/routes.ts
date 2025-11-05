import { Application } from 'express';

import { users as adminUsers } from './controllers/admin';
import { getAllPokemons } from './controllers/cards';
import { healthCheck } from './controllers/healthCheck';
import { getTodos } from './controllers/todos';
import { getUsers, getUserById, createUser, loginUser } from './controllers/users';
import { authenticateToken } from './middlewares/auth.middleware';
import { requireAdmin } from './middlewares/authorization.middleware';
import { validateRegistration, validateLogin, validateAdminUserCreation } from './middlewares/validation.middleware';

export const init = (app: Application): void => {
  // Public routes
  app.get('/health', healthCheck);
  app.post('/users', validateRegistration, createUser);
  app.post('/users/login', validateLogin, loginUser);
  app.get('/todos', getTodos);
  app.get('/cards', getAllPokemons);

  // Protected routes
  app.get('/users', authenticateToken, getUsers);
  app.get('/users/:id', authenticateToken, getUserById);

  // Admin routes
  app.post('/admin/users', authenticateToken, requireAdmin, validateAdminUserCreation, adminUsers);
};
