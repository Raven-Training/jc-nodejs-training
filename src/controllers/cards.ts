import { Request, Response, NextFunction } from 'express';
import status from 'http-status';

import { getValidPage } from '../helpers/pagination.helper';
import { getPokemons } from '../services/cards';
import {
  purchasePokemon as purchasePokemonService,
  getUserPokemonCollection,
} from '../services/pokemonPurchase';
import { Pokemon } from '../types/cards.types';
import { DEFAULT_LIMIT } from '../types/pagination.types';

export async function getAllPokemons(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    const pokemons: Pokemon[] = await getPokemons();

    if (!pokemons || pokemons.length === 0) {
      console.warn('Controller - No Pokemons found from service');
      return res.status(status.NO_CONTENT).send();
    }

    console.info('Controller - successfully retrieved and sending Pokemons');
    return res.status(status.OK).json(pokemons);
  } catch (err) {
    console.error('Controller Error - Failed to process request for Pokemons:', err);
    next(err);
  }
}

export async function purchasePokemon(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      console.warn('Controller - Purchase attempt without authenticated user');
      return res.status(status.UNAUTHORIZED).json({
        message: 'Authentication required to purchase Pokemon',
      });
    }

    const { pokemonName } = req.body;

    console.info(`Controller - Processing Pokemon purchase: ${pokemonName} for user ${userId}`);

    const purchaseResult = await purchasePokemonService(userId, pokemonName);

    console.info(`Controller - Pokemon purchase successful: ${pokemonName} for user ${userId}`);

    return res.status(status.CREATED).json({
      message: `Pokemon '${purchaseResult.pokemonName}' purchased successfully`,
      data: purchaseResult,
    });
  } catch (err) {
    console.error('Controller Error - Failed to process Pokemon purchase:', err);
    next(err);
  }
}

export async function getPokemonCollection(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      console.warn('Controller - Collection request without authenticated user');
      return res.status(status.UNAUTHORIZED).json({
        message: 'Authentication required to view Pokemon collection',
      });
    }

    const page = getValidPage(req.query.page as string);
    const limit = parseInt(req.query.limit as string) || DEFAULT_LIMIT;

    console.info(
      `Controller - Retrieving Pokemon collection for user ${userId} (page: ${page}, limit: ${limit})`,
    );

    const collectionResult = await getUserPokemonCollection(userId, page, limit);

    console.info(`Controller - Pokemon collection retrieved successfully for user ${userId}`);

    return res.status(status.OK).json({
      message: 'Pokemon collection retrieved successfully',
      data: collectionResult.purchases,
      pagination: collectionResult.pagination,
    });
  } catch (err) {
    console.error('Controller Error - Failed to retrieve Pokemon collection:', err);
    next(err);
  }
}
