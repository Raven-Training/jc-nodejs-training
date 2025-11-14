import { PaginationMetadata } from './pagination.types';

export interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  types: {
    type: {
      name: string;
    };
  }[];
  weight: number;
  height: number;
}

export interface PokemonPurchaseRequest {
  readonly pokemonName: string;
}

export interface PokemonPurchaseResponse {
  readonly id: number;
  readonly pokemonId: number;
  readonly pokemonName: string;
  readonly pokemonImage: string;
  readonly pokemonTypes: readonly string[];
  readonly price: number;
  readonly purchasedAt: Date;
}

export interface PokemonCollectionResponse {
  readonly message: string;
  readonly data: readonly PokemonPurchaseResponse[];
  readonly pagination: PaginationMetadata;
}

export const POKEMON_BASE_PRICE = 50;
export const POKEMON_MINIMUM_PRICE = 10;
export const WEIGHT_HEIGHT_DIVISOR = 10;
export const TYPE_BONUS_MULTIPLIER = 10;

export const HTTP_INTERNAL_SERVER_ERROR = 500;
export const HTTP_CONFLICT = 409;

export const POKEMON_NAME_MIN_LENGTH = 1;
export const POKEMON_NAME_MAX_LENGTH = 30;
