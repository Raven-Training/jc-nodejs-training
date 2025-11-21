import { Repository } from 'typeorm';

import { AppDataSource } from '../data-source';
import { PokemonPurchase } from '../entities/PokemonPurchase';
import { Team } from '../entities/Team';
import { alreadyExistError, notFoundError } from '../errors';
import { validatePokemonOwnership, findDuplicatePokemon } from '../helpers/pokemonOwnership.helper';
import { validatePokemonTypeCompatibility } from '../helpers/teamTypeCompatibility.helper';
import { mapAddPokemonToTeamResponse } from '../mappers/addPokemonToTeam.mapper';
import { mapTeamToResponse } from '../mappers/team.mapper';
import { createInternalError } from '../middlewares/error.middleware';
import {
  ICreateTeamRequest,
  TeamResponse,
  POSTGRES_UNIQUE_VIOLATION,
  IAddPokemonToTeamRequest,
  IAddPokemonToTeamResponse,
  MAX_POKEMONS_PER_REQUEST,
  MIN_POKEMONS_PER_REQUEST,
  MAX_TEAM_SIZE,
  PokemonType,
} from '../types/teams.types';

const teamRepository: Repository<Team> = AppDataSource.getRepository(Team);

function handleTeamCreationError(
  error: unknown,
  userId: number,
  teamData: ICreateTeamRequest,
): never {
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === POSTGRES_UNIQUE_VIOLATION
  ) {
    console.warn(
      `User ${userId} already has a team of type ${teamData.teamType}. Creation aborted.`,
    );
    throw alreadyExistError(`A team of type '${teamData.teamType}' already exists.`);
  }

  console.error(`Teams - Error creating team for user ${userId}:`, error);
  throw createInternalError('DATABASE_ERROR', 500)(
    'Failed to create team',
    error instanceof Error ? error : undefined,
  );
}

function validateBasicRequest(pokemonIds: readonly number[]): void {
  if (
    pokemonIds.length < MIN_POKEMONS_PER_REQUEST ||
    pokemonIds.length > MAX_POKEMONS_PER_REQUEST
  ) {
    throw createInternalError(
      'INVALID_REQUEST',
      400,
    )(
      `pokemonIds must contain between ${MIN_POKEMONS_PER_REQUEST} and ${MAX_POKEMONS_PER_REQUEST} items`,
    );
  }
}

async function validateTeamModification(
  userId: number,
  teamId: number,
  pokemonIds: readonly number[],
): Promise<{ team: Team; purchases: PokemonPurchase[] }> {
  console.info(`Teams - Adding ${pokemonIds.length} pokemons to team ${teamId} by user ${userId}`);

  const team = await teamRepository.findOne({
    where: { id: teamId },
    relations: ['user', 'pokemons'],
  });

  if (!team || !team.user || team.user.id !== userId) {
    console.warn(`Teams - Team ${teamId} not found or not owned by user ${userId}`);
    throw notFoundError('Team not found or you do not have permission to modify it');
  }

  const currentTeamSize = team.pokemons?.length || 0;
  const newTotalSize = currentTeamSize + pokemonIds.length;

  if (newTotalSize > MAX_TEAM_SIZE) {
    console.warn(
      `Teams - Team ${teamId} capacity exceeded. Current: ${currentTeamSize}, Adding: ${pokemonIds.length}, Max: ${MAX_TEAM_SIZE}`,
    );
    throw createInternalError(
      'TEAM_CAPACITY_EXCEEDED',
      400,
    )(
      `Cannot add ${pokemonIds.length} Pokémon. Team would exceed maximum size of ${MAX_TEAM_SIZE}. Current: ${currentTeamSize}`,
    );
  }

  const purchases = await validatePokemonOwnership(pokemonIds, userId);

  const validation = validatePokemonTypeCompatibility(
    team.teamType as PokemonType,
    purchases.map((p) => ({
      id: p.id,
      pokemonName: p.pokemonName,
      pokemonTypes: p.pokemonTypes,
    })),
  );

  if (!validation.isValid) {
    const incompatible = validation.incompatiblePokemons;
    console.warn(
      `Teams - Compatibility validation failed for team ${teamId}. Incompatible pokemons: ${incompatible
        .map((i) => i.id)
        .join(', ')}`,
    );
    throw createInternalError(
      'TYPE_MISMATCH',
      400,
    )('Some Pokémon are incompatible with the team type');
  }

  const existingPokemonIds = team.pokemons?.map((p) => p.id) || [];
  const duplicates = findDuplicatePokemon(purchases, existingPokemonIds);

  if (duplicates.length > 0) {
    const dupIds = duplicates.map((d) => d.id);
    console.warn(
      `Teams - Attempt to add already-present pokemons to team ${teamId}: ${dupIds.join(', ')}`,
    );
    throw alreadyExistError('Some Pokémon are already in this team');
  }

  return { team, purchases };
}

export async function createTeam(
  userId: number,
  teamData: ICreateTeamRequest,
): Promise<TeamResponse> {
  try {
    console.info(`Initiating team creation for user ${userId} with type ${teamData.teamType}`);

    const newTeam = teamRepository.create({
      name: teamData.name,
      teamType: teamData.teamType,
      user: { id: userId },
    });

    const savedTeam = await teamRepository.save(newTeam);

    console.info(`Team '${savedTeam.name}' created successfully for user ${userId}.`);

    return mapTeamToResponse(savedTeam);
  } catch (error) {
    handleTeamCreationError(error, userId, teamData);
  }
}

export async function addPokemonsToTeam(
  userId: number,
  teamId: number,
  request: IAddPokemonToTeamRequest,
): Promise<IAddPokemonToTeamResponse> {
  const pokemonIds = request.pokemonIds || [];

  validateBasicRequest(pokemonIds);

  const { team, purchases } = await validateTeamModification(userId, teamId, pokemonIds);

  team.pokemons = [...(team.pokemons || []), ...purchases];
  const savedTeam = await teamRepository.save(team);

  console.info(`Teams - Added ${purchases.length} pokemons to team ${teamId} successfully`);

  return mapAddPokemonToTeamResponse(savedTeam, purchases);
}
