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
