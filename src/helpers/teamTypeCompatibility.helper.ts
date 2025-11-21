import {
  PokemonType,
  IPokemonValidationResult,
  UNIVERSAL_COMPATIBLE_TYPE,
} from '../types/teams.types';

export function isPokemonCompatibleWithTeam(
  teamType: PokemonType,
  pokemonTypes: readonly string[],
): boolean {
  if (teamType === UNIVERSAL_COMPATIBLE_TYPE) {
    return true;
  }

  return pokemonTypes.some((type) => type === teamType || type === UNIVERSAL_COMPATIBLE_TYPE);
}

export function getAllowedPokemonTypes(teamType: PokemonType): readonly PokemonType[] {
  if (teamType === UNIVERSAL_COMPATIBLE_TYPE) {
    return Object.values(PokemonType);
  }

  return [teamType, UNIVERSAL_COMPATIBLE_TYPE] as const;
}

export function validatePokemonTypeCompatibility(
  teamType: PokemonType,
  pokemons: readonly { id: number; pokemonName: string; pokemonTypes: readonly string[] }[],
): IPokemonValidationResult {
  const incompatiblePokemons = pokemons
    .filter((pokemon) => !isPokemonCompatibleWithTeam(teamType, pokemon.pokemonTypes))
    .map((pokemon) => ({
      id: pokemon.id,
      name: pokemon.pokemonName,
      types: pokemon.pokemonTypes,
    }));

  return {
    isValid: incompatiblePokemons.length === 0,
    incompatiblePokemons,
  };
}
