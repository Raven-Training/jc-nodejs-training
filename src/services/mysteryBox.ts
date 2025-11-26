import { Repository } from 'typeorm';

import { AppDataSource } from '../data-source';
import { PokemonPurchase } from '../entities/PokemonPurchase';
import { getRandomPokemonByRarity } from '../helpers/pokemonRarity.helper';
import { mapPokemonPurchaseToResponse } from '../mappers/pokemonPurchase.mapper';
import { createInternalError } from '../middlewares/error.middleware';
import { MYSTERY_BOX_PRICE, IMysteryBoxPurchaseResponse } from '../types/mysteryBox.types';

import { calculatePokemonPrice } from './pokemonPurchase';

const pokemonPurchaseRepository: Repository<PokemonPurchase> =
  AppDataSource.getRepository(PokemonPurchase);

export async function purchaseMysteryBox(userId: number): Promise<IMysteryBoxPurchaseResponse> {
  try {
    console.info(`Mystery Box - User ${userId} initiating mystery box purchase`);

    const { pokemon, rarity } = await getRandomPokemonByRarity();

    const pokemonTypes = pokemon.types.map((typeObj) => typeObj.type.name);
    const pokemonPrice = calculatePokemonPrice(pokemon);

    const purchase = pokemonPurchaseRepository.create({
      pokemonId: pokemon.id,
      pokemonName: pokemon.name,
      pokemonImage: pokemon.sprites.front_default,
      pokemonTypes,
      userId,
      price: pokemonPrice,
    });

    const savedPurchase = await pokemonPurchaseRepository.save(purchase);

    console.info(
      `Mystery Box - User ${userId} successfully purchased ${pokemon.name} (${rarity} rarity, value: ${pokemonPrice}) from mystery box (cost: ${MYSTERY_BOX_PRICE})`,
    );

    const purchaseResponse = mapPokemonPurchaseToResponse(savedPurchase);

    return {
      message: `Congratulations! You got a ${rarity} Pokemon!`,
      data: {
        ...purchaseResponse,
        rarity,
      },
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'internalCode' in error) {
      throw error;
    }

    console.error(`Mystery Box - Error during purchase for user ${userId}:`, error);
    throw createInternalError('MYSTERY_BOX_PURCHASE_ERROR', 500)(
      'Failed to complete mystery box purchase',
      error instanceof Error ? error : undefined,
    );
  }
}
