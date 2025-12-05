import config from '../config/config';
import { createInternalError } from '../middlewares/error.middleware';
import { Pokemon } from '../types/cards.types';
import { RarityLevel, WEIGHT_TO_RARITY_MAP, RARITY_PROBABILITIES } from '../types/mysteryBox.types';

import { createAxiosInstance } from './axios.helper';

let pokemonCache: Pokemon[] | null = null;
let rarityBucketsCache: Map<RarityLevel, Pokemon[]> | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export function calculatePokemonRarity(weight: number): RarityLevel {
  if (!weight || weight <= 0 || !Number.isFinite(weight)) {
    console.error(
      `CRITICAL - Invalid pokemon weight detected: ${weight}. Defaulting to COMMON to prevent exploitation.`,
    );
    return RarityLevel.COMMON;
  }

  const rarityConfig = WEIGHT_TO_RARITY_MAP.find(
    (config) => weight >= config.weightRange.min && weight <= config.weightRange.max,
  );

  if (!rarityConfig) {
    console.warn(
      `Pokemon weight ${weight} outside defined ranges (possible new Pokemon or API change), defaulting to COMMON rarity`,
    );
    return RarityLevel.COMMON;
  }

  return rarityConfig.level;
}

function isCacheValid(): boolean {
  if (!pokemonCache || !rarityBucketsCache || !cacheTimestamp) {
    return false;
  }

  const now = Date.now();
  const cacheAge = now - cacheTimestamp;

  return cacheAge < CACHE_TTL_MS;
}

function categorizePokemonsByRarity(pokemons: Pokemon[]): Map<RarityLevel, Pokemon[]> {
  const rarityBuckets = new Map<RarityLevel, Pokemon[]>();

  for (const rarity of Object.values(RarityLevel)) {
    rarityBuckets.set(rarity, []);
  }

  pokemons.forEach((pokemon) => {
    const rarity = calculatePokemonRarity(pokemon.weight);
    rarityBuckets.get(rarity)?.push(pokemon);
  });

  console.info(
    `PokeAPI - Categorized pokemons: ${Array.from(rarityBuckets.entries())
      .map(([rarity, pokemons]) => `${rarity}=${pokemons.length}`)
      .join(', ')}`,
  );

  return rarityBuckets;
}

async function fetchPokemonsFromAPI(
  limit: number = config.pokeApi.pokemonLimit,
): Promise<Pokemon[]> {
  console.info(`PokeAPI - Cache miss, fetching ${limit} pokemons from API`);

  const { data } = await createAxiosInstance(config.pokeApi.baseURL).get<{
    results: { name: string; url: string }[];
  }>(`pokemon?limit=${limit}`);

  console.info(`PokeAPI - Retrieved ${data.results.length} available pokemons`);

  const pokemonDetailsPromises = data.results.map(async (pokemon) => {
    const { data: pokemonData } = await createAxiosInstance(config.pokeApi.baseURL).get<Pokemon>(
      `pokemon/${pokemon.name}`,
    );
    return pokemonData;
  });

  const allPokemons = await Promise.all(pokemonDetailsPromises);
  console.info(`PokeAPI - Successfully fetched details for ${allPokemons.length} pokemons`);

  return allPokemons;
}

async function getAllAvailablePokemons(
  limit: number = config.pokeApi.pokemonLimit,
): Promise<Pokemon[]> {
  try {
    if (isCacheValid() && pokemonCache && rarityBucketsCache) {
      console.info(
        `PokeAPI - Cache hit, returning ${pokemonCache.length} cached pokemons (age: ${Math.floor((Date.now() - (cacheTimestamp || 0)) / 1000 / 60)} minutes)`,
      );
      return pokemonCache;
    }

    const allPokemons = await fetchPokemonsFromAPI(limit);

    pokemonCache = allPokemons;
    rarityBucketsCache = categorizePokemonsByRarity(allPokemons);
    cacheTimestamp = Date.now();
    console.info('PokeAPI - Cache updated successfully with categorized rarity buckets');

    return allPokemons;
  } catch (error) {
    console.error('PokeAPI - Error fetching available pokemons:', error);
    throw createInternalError('POKEAPI_ERROR', 500)(
      'Failed to fetch available pokemons from PokeAPI',
      error instanceof Error ? error : undefined,
    );
  }
}

function selectRandomFromCommonBucket(): { pokemon: Pokemon; rarity: RarityLevel } {
  if (!rarityBucketsCache) {
    throw createInternalError('CACHE_NOT_INITIALIZED', 500)('Rarity buckets cache not initialized');
  }

  const commonBucket = rarityBucketsCache.get(RarityLevel.COMMON) || [];
  if (!commonBucket.length) {
    throw createInternalError(
      'NO_POKEMON_AVAILABLE',
      500,
    )('No pokemons available in any rarity tier');
  }

  const randomIndex = Math.floor(Math.random() * commonBucket.length);
  const selectedPokemon = commonBucket[randomIndex];

  return { pokemon: selectedPokemon, rarity: RarityLevel.COMMON };
}

function selectPokemonByWeightedRandom(): { pokemon: Pokemon; rarity: RarityLevel } {
  if (!rarityBucketsCache) {
    throw createInternalError('CACHE_NOT_INITIALIZED', 500)('Rarity buckets cache not initialized');
  }

  const random = Math.random();
  let cumulativeProbability = 0;

  for (const [rarity, probability] of Object.entries(RARITY_PROBABILITIES)) {
    cumulativeProbability += probability;

    if (random <= cumulativeProbability) {
      const bucket = rarityBucketsCache.get(rarity as RarityLevel) || [];

      if (!bucket.length) {
        console.warn(`No pokemons available for rarity ${rarity}, selecting from common`);
        const result = selectRandomFromCommonBucket();
        console.info(
          `Mystery Box - Selected ${result.pokemon.name} with COMMON rarity (weight: ${result.pokemon.weight}) [fallback from ${rarity}]`,
        );
        return result;
      }

      const randomIndex = Math.floor(Math.random() * bucket.length);
      const selectedPokemon = bucket[randomIndex];

      console.info(
        `Mystery Box - Selected ${selectedPokemon.name} with ${rarity} rarity (weight: ${selectedPokemon.weight})`,
      );

      return { pokemon: selectedPokemon, rarity: rarity as RarityLevel };
    }
  }

  const result = selectRandomFromCommonBucket();
  console.info(
    `Mystery Box - Selected ${result.pokemon.name} with COMMON rarity (weight: ${result.pokemon.weight}) [default fallback]`,
  );
  return result;
}

export async function getRandomPokemonByRarity(
  limit: number = config.pokeApi.pokemonLimit,
): Promise<{
  pokemon: Pokemon;
  rarity: RarityLevel;
}> {
  try {
    console.info(`Mystery Box - Starting random pokemon selection process (limit: ${limit})`);

    await getAllAvailablePokemons(limit);

    if (!rarityBucketsCache) {
      throw createInternalError(
        'CACHE_NOT_INITIALIZED',
        500,
      )('Rarity buckets cache not initialized after fetching pokemons');
    }

    const { pokemon, rarity } = selectPokemonByWeightedRandom();

    console.info(`Mystery Box - Successfully selected ${pokemon.name} with ${rarity} rarity`);

    return {
      pokemon,
      rarity,
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'internalCode' in error) {
      throw error;
    }

    console.error('Mystery Box - Error during random pokemon selection:', error);
    throw createInternalError('MYSTERY_BOX_ERROR', 500)(
      'Failed to select random pokemon',
      error instanceof Error ? error : undefined,
    );
  }
}
