import { In } from 'typeorm';

import { AppDataSource } from '../data-source';
import { PokemonPurchase } from '../entities/PokemonPurchase';
import { notFoundError } from '../errors';
import { createInternalError } from '../middlewares/error.middleware';

const pokemonPurchaseRepository = AppDataSource.getRepository(PokemonPurchase);

export async function validatePokemonOwnership(
  pokemonIds: readonly number[],
  userId: number,
): Promise<PokemonPurchase[]> {
  const purchases = await pokemonPurchaseRepository.find({
    where: { id: In([...pokemonIds]) },
  });

  const foundIds = purchases.map((p) => p.id);
  const missingIds = pokemonIds.filter((id) => !foundIds.includes(id));

  if (missingIds.length > 0) {
    console.warn(`Pokemon purchases not found: ${missingIds.join(', ')}`);
    throw notFoundError('Some specified Pokemon purchases were not found');
  }

  const notOwnedPurchases = purchases.filter((p) => p.userId !== userId);

  if (notOwnedPurchases.length > 0) {
    const notOwnedIds = notOwnedPurchases.map((p) => p.id);
    console.warn(
      `User ${userId} attempted to use purchases they don't own: ${notOwnedIds.join(', ')}`,
    );
    throw createInternalError(
      'POKEMON_NOT_OWNED',
      403,
    )('You do not own some of the specified Pokémon');
  }

  return purchases;
}

export function findDuplicatePokemon(
  purchases: readonly PokemonPurchase[],
  existingPokemonIds: readonly number[],
): PokemonPurchase[] {
  const existingIdsSet = new Set(existingPokemonIds);
  return purchases.filter((p) => existingIdsSet.has(p.id));
}
