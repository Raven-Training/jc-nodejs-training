import { Request, Response, NextFunction } from 'express';

import { getPokemons } from '../services/Cards';
import { PokemonList } from '../types/cards.types';

export function getAllPokemons(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  return getPokemons()
    .then((pokemons: PokemonList) => res.status(200).json(pokemons))
    .catch((err: Error) => next(err));
}
