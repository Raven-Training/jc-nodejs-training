import { Request, Response, NextFunction } from 'express';
import { validationResult, body, ValidationChain, query, param } from 'express-validator';

import { findUser } from '../services/users';
import { POKEMON_NAME_MIN_LENGTH, POKEMON_NAME_MAX_LENGTH } from '../types/cards.types';
import { MINIMUM_PAGE, MINIMUM_LIMIT, MAXIMUM_LIMIT } from '../types/pagination.types';
import {
  PokemonType,
  TEAM_NAME_MIN_LENGTH,
  TEAM_NAME_MAX_LENGTH,
  MAX_POKEMONS_PER_REQUEST,
  MIN_POKEMONS_PER_REQUEST,
} from '../types/teams.types';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  next();
};

export const validate = (
  rules: ValidationChain[],
  customValidators: Array<
    (req: Request, res: Response, next: NextFunction) => void | Promise<void>
  > = [],
) => [...rules, handleValidationErrors, ...customValidators];

const checkEmailExistence = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const email = req.body.email;
  const existingUser = await findUser({ where: { email } });

  if (existingUser) {
    res.status(409).json({
      message: 'Email already exists',
      field: 'email',
    });
    return;
  }

  next();
};

const userValidationRules = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('name').notEmpty().withMessage('Name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
];

export const validateRegistration = validate(userValidationRules, [checkEmailExistence]);

export const validateAdminUserCreation = validate(userValidationRules, []);

export const validateLogin = validate([
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
]);

const pokemonPurchaseRules = [
  body('pokemonName')
    .notEmpty()
    .withMessage('Pokemon name is required')
    .isLength({ min: POKEMON_NAME_MIN_LENGTH, max: POKEMON_NAME_MAX_LENGTH })
    .withMessage(
      `Pokemon name must be between ${POKEMON_NAME_MIN_LENGTH} and ${POKEMON_NAME_MAX_LENGTH} characters`,
    )
    .matches(/^[a-zA-Z0-9\-]+$/)
    .withMessage('Pokemon name can only contain letters, numbers, and hyphens')
    .toLowerCase(),
];

export const validatePokemonPurchase = validate(pokemonPurchaseRules);

const pokemonCollectionRules = [
  query('page')
    .optional()
    .isInt({ min: MINIMUM_PAGE })
    .withMessage(`Page must be at least ${MINIMUM_PAGE}`)
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: MINIMUM_LIMIT, max: MAXIMUM_LIMIT })
    .withMessage(`Limit must be between ${MINIMUM_LIMIT} and ${MAXIMUM_LIMIT}`)
    .toInt(),
];

export const validatePokemonCollection = validate(pokemonCollectionRules);

const teamCreationRules = [
  body('name')
    .notEmpty()
    .withMessage('Team name is required')
    .isLength({ min: TEAM_NAME_MIN_LENGTH, max: TEAM_NAME_MAX_LENGTH })
    .withMessage(
      `Team name must be between ${TEAM_NAME_MIN_LENGTH} and ${TEAM_NAME_MAX_LENGTH} characters`,
    )
    .matches(/^[a-zA-Z0-9\s\-]+$/)
    .withMessage('Team name can only contain letters, numbers, spaces, and hyphens'),
  body('teamType')
    .notEmpty()
    .withMessage('Team type is required')
    .isIn(Object.values(PokemonType))
    .withMessage('Invalid team type'),
];

export const validateTeamCreation = validate(teamCreationRules);

const addPokemonToTeamRules = [
  param('teamId')
    .notEmpty()
    .withMessage('Team ID is required')
    .isInt({ min: 1 })
    .withMessage('Team ID must be a positive integer'),
  body('pokemonIds')
    .isArray({ min: MIN_POKEMONS_PER_REQUEST, max: MAX_POKEMONS_PER_REQUEST })
    .withMessage(
      `pokemonIds must be an array with ${MIN_POKEMONS_PER_REQUEST} to ${MAX_POKEMONS_PER_REQUEST} items`,
    ),
  body('pokemonIds.*').isInt({ min: 1 }).withMessage('Each Pokemon ID must be a positive integer'),
];

export const validateAddPokemonToTeam = validate(addPokemonToTeamRules);

export const validateMysteryBoxPurchase = validate([]);
