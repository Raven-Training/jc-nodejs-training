import { Repository } from 'typeorm';

import config from '../config/config';
import { AppDataSource } from '../data-source';
import { PokemonPurchase } from '../entities/PokemonPurchase';
import { createAxiosInstance } from '../helpers/axios.helper';
import { createPaginationParams, calculatePaginationMetadata } from '../helpers/pagination.helper';
import { normalizePokemonName } from '../helpers/pokemon.helper';
import { mapPokemonPurchaseToResponse } from '../mappers/pokemonPurchase.mapper';
import { createInternalError } from '../middlewares/error.middleware';
import {
  Pokemon,
  PokemonPurchaseResponse,
  POKEMON_BASE_PRICE,
  POKEMON_MINIMUM_PRICE,
  WEIGHT_HEIGHT_DIVISOR,
  TYPE_BONUS_MULTIPLIER,
  HTTP_INTERNAL_SERVER_ERROR,
  HTTP_CONFLICT,
} from '../types/cards.types';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../types/pagination.types';

const pokemonPurchaseRepository: Repository<PokemonPurchase> =
  AppDataSource.getRepository(PokemonPurchase);

export async function getPokemonDetails(pokemonName: string): Promise<Pokemon> {
  try {
    const normalizedName = normalizePokemonName(pokemonName);
    const { data } = await createAxiosInstance(config.pokeApi.baseURL).get<Pokemon>(
      `pokemon/${normalizedName}`,
    );
    console.info(`PokeAPI - Data for 'pokemon/${normalizedName}' obtained successfully.`);
    return data;
  } catch (error) {
    console.error(`PokeAPI - Error fetching data for 'pokemon/${pokemonName}':`, error);
    throw createInternalError('POKEAPI_ERROR', HTTP_INTERNAL_SERVER_ERROR)(
      'Failed to fetch data from PokeAPI',
      error instanceof Error ? error : undefined,
    );
  }
}

export function calculatePokemonPrice(pokemonData: Pokemon): number {
  const basePrice = POKEMON_BASE_PRICE;

  const weightFactor = Math.floor(pokemonData.weight / WEIGHT_HEIGHT_DIVISOR);
  const heightFactor = Math.floor(pokemonData.height / WEIGHT_HEIGHT_DIVISOR);
  const typesBonus = pokemonData.types.length * TYPE_BONUS_MULTIPLIER;

  const finalPrice = basePrice + weightFactor + heightFactor + typesBonus;

  console.info(`PokeAPI - Pokemon price calculated successfully.`);
  return Math.max(finalPrice, POKEMON_MINIMUM_PRICE);
}

export async function hasUserPurchasedPokemon(
  userId: number,
  pokemonName: string,
): Promise<boolean> {
  try {
    const normalizedName = normalizePokemonName(pokemonName);

    const existingPurchase = await pokemonPurchaseRepository.findOne({
      where: {
        userId,
        pokemonName: normalizedName,
      },
    });

    const hasPurchased = !!existingPurchase;
    console.info(`PokeAPI - Pokemon purchase verification completed successfully.`);

    return hasPurchased;
  } catch (error) {
    console.error(`PokeAPI - Error checking Pokemon purchase:`, error);
    throw createInternalError('DATABASE_ERROR', HTTP_INTERNAL_SERVER_ERROR)(
      'Failed to verify Pokemon purchase status',
      error instanceof Error ? error : undefined,
    );
  }
}

export async function purchasePokemon(
  userId: number,
  pokemonName: string,
): Promise<PokemonPurchaseResponse> {
  try {
    const normalizedName = normalizePokemonName(pokemonName);

    const pokemonData = await getPokemonDetails(normalizedName);

    const alreadyPurchased = await hasUserPurchasedPokemon(userId, normalizedName);
    if (alreadyPurchased) {
      throw createInternalError(
        'DUPLICATE_PURCHASE',
        HTTP_CONFLICT,
      )(`You have already purchased ${pokemonData.name}`);
    }

    const price = calculatePokemonPrice(pokemonData);

    const pokemonTypes = pokemonData.types.map((typeObj) => typeObj.type.name);

    const purchase = pokemonPurchaseRepository.create({
      pokemonId: pokemonData.id,
      pokemonName: pokemonData.name,
      pokemonImage: pokemonData.sprites.front_default,
      pokemonTypes,
      userId,
      price,
    });

    const savedPurchase = await pokemonPurchaseRepository.save(purchase);

    console.info(`PokeAPI - Pokemon purchase completed successfully.`);

    return mapPokemonPurchaseToResponse(savedPurchase);
  } catch (error) {
    if (error instanceof Error && error.name.includes('ERROR')) {
      throw error;
    }

    console.error(`PokeAPI - Error during Pokemon purchase:`, error);
    throw createInternalError('DATABASE_ERROR', HTTP_INTERNAL_SERVER_ERROR)(
      'Failed to complete Pokemon purchase',
      error instanceof Error ? error : undefined,
    );
  }
}

export async function getUserPokemonCollection(
  userId: number,
  page: number = DEFAULT_PAGE,
  limit: number = DEFAULT_LIMIT,
) {
  try {
    const paginationParams = createPaginationParams(page, limit);
    const { offset, limit: validLimit } = paginationParams;

    const [purchases, total] = await pokemonPurchaseRepository.findAndCount({
      where: { userId },
      order: { purchasedAt: 'DESC' },
      skip: offset,
      take: validLimit,
    });

    const pagination = calculatePaginationMetadata(page, validLimit, total);

    console.info(`PokeAPI - Pokemon collection retrieved successfully.`);

    return {
      purchases: purchases.map(mapPokemonPurchaseToResponse),
      pagination,
    };
  } catch (error) {
    console.error(`PokeAPI - Error retrieving Pokemon collection:`, error);
    throw createInternalError('DATABASE_ERROR', HTTP_INTERNAL_SERVER_ERROR)(
      'Failed to retrieve Pokemon collection',
      error instanceof Error ? error : undefined,
    );
  }
}
