import { Request, Response, NextFunction } from 'express';

import { getPokemons } from '../services/cards';
import { Pokemon } from '../types/cards.types';

export async function getAllPokemons(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    const pokemons: Pokemon[] = await getPokemons();
    console.info('Controller - successfully retrieved and sending Pokemons');
    return res.status(200).json(pokemons);
  } catch (error) {
    console.error('Controller Error - Failed to process request for Pokemons:', error);
    next(error instanceof Error ? error : new Error('Unknown error occurred in getAllPokemons'));
  }
}
