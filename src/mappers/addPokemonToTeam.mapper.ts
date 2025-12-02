import { PokemonPurchase } from '../entities/PokemonPurchase';
import { Team } from '../entities/Team';
import { IAddPokemonToTeamResponse, IPokemonSummary } from '../types/teams.types';

export function mapPokemonPurchasesToSummaries(
  purchases: readonly PokemonPurchase[],
): IPokemonSummary[] {
  return purchases.map((purchase) => ({
    id: purchase.id,
    pokemonName: purchase.pokemonName,
    pokemonTypes: purchase.pokemonTypes,
    pokemonImage: purchase.pokemonImage,
  }));
}

export function mapAddPokemonToTeamResponse(
  team: Team,
  addedPurchases: readonly PokemonPurchase[],
): IAddPokemonToTeamResponse {
  const addedSummaries = mapPokemonPurchasesToSummaries(addedPurchases);

  return {
    message: `${addedSummaries.length} Pokémon added to team '${team.name}' successfully`,
    data: {
      teamId: team.id,
      teamName: team.name,
      teamType: team.teamType,
      addedPokemons: addedSummaries,
      totalPokemonsInTeam: team.pokemons?.length || addedSummaries.length,
    },
  };
}
