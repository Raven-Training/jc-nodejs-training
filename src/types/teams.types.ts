export enum PokemonType {
  NORMAL = 'normal',
  FIRE = 'fire',
  WATER = 'water',
  GRASS = 'grass',
  ELECTRIC = 'electric',
  ICE = 'ice',
  FIGHTING = 'fighting',
  POISON = 'poison',
  GROUND = 'ground',
  FLYING = 'flying',
  PSYCHIC = 'psychic',
  BUG = 'bug',
  ROCK = 'rock',
  GHOST = 'ghost',
  DRAGON = 'dragon',
  DARK = 'dark',
  STEEL = 'steel',
  FAIRY = 'fairy',
}

export interface ICreateTeamRequest {
  name: string;
  teamType: PokemonType;
}

export interface TeamResponse {
  readonly id: number;
  readonly name: string;
  readonly teamType: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export const TEAM_NAME_MIN_LENGTH = 3;
export const TEAM_NAME_MAX_LENGTH = 30;
export const POSTGRES_UNIQUE_VIOLATION = '23505';

export interface IAddPokemonToTeamRequest {
  readonly pokemonIds: readonly number[];
}

export interface IPokemonSummary {
  readonly id: number;
  readonly pokemonName: string;
  readonly pokemonTypes: readonly string[];
  readonly pokemonImage: string;
}

export interface IAddPokemonToTeamResponse {
  readonly message: string;
  readonly data: {
    readonly teamId: number;
    readonly teamName: string;
    readonly teamType: string;
    readonly addedPokemons: readonly IPokemonSummary[];
    readonly totalPokemonsInTeam: number;
  };
}

export interface IPokemonValidationResult {
  readonly isValid: boolean;
  readonly incompatiblePokemons: readonly {
    readonly id: number;
    readonly name: string;
    readonly types: readonly string[];
  }[];
}

export const MAX_POKEMONS_PER_REQUEST = 6;
export const MIN_POKEMONS_PER_REQUEST = 1;
export const MAX_TEAM_SIZE = 6;
export const UNIVERSAL_COMPATIBLE_TYPE = PokemonType.NORMAL;
