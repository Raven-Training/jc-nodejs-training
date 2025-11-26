import { Application } from 'express';

import { createAdminUser } from './controllers/admin';
import { getAllPokemons, purchasePokemon, getPokemonCollection } from './controllers/cards';
import { healthCheck } from './controllers/healthCheck';
import { purchaseMysteryBox } from './controllers/mysteryBox';
import { createTeam, addPokemonToTeam } from './controllers/teams';
import { getTodos } from './controllers/todos';
import { getUsers, getUserById, createUser, loginUser } from './controllers/users';
import { authenticateToken } from './middlewares/auth.middleware';
import { requireAdmin } from './middlewares/authorization.middleware';
import {
  validateRegistration,
  validateLogin,
  validateAdminUserCreation,
  validatePokemonPurchase,
  validatePokemonCollection,
  validateTeamCreation,
  validateAddPokemonToTeam,
  validateMysteryBoxPurchase,
} from './middlewares/validation.middleware';

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
  // Pokemon
  app.post('/cards/purchase', authenticateToken, validatePokemonPurchase, purchasePokemon);
  app.get('/cards/collection', authenticateToken, validatePokemonCollection, getPokemonCollection);
  // Mystery Box
  app.post('/mystery-box', authenticateToken, validateMysteryBoxPurchase, purchaseMysteryBox);
  // Team
  app.post('/teams', authenticateToken, validateTeamCreation, createTeam);
  app.post(
    '/teams/:teamId/pokemons',
    authenticateToken,
    validateAddPokemonToTeam,
    addPokemonToTeam,
  );
  // Admin
  app.post(
    '/admin/users',
    authenticateToken,
    requireAdmin,
    validateAdminUserCreation,
    createAdminUser,
  );
};
