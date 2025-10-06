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

    if (!pokemons || pokemons.length === 0) {
      console.warn('Controller - No Pokemons found from service');
      return res.status(204).send();
    }

    console.info('Controller - successfully retrieved and sending Pokemons');
    return res.status(200).json(pokemons);
  } catch (err) {
    console.error('Controller Error - Failed to process request for Pokemons:', err);
    next(err);
  }
}
