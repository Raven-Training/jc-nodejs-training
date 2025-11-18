import { Repository } from 'typeorm';

import { AppDataSource } from '../data-source';
import { Team } from '../entities/Team';
import { alreadyExistError } from '../errors';
import { mapTeamToResponse } from '../mappers/team.mapper';
import { createInternalError } from '../middlewares/error.middleware';
import { ICreateTeamRequest, TeamResponse, POSTGRES_UNIQUE_VIOLATION } from '../types/teams.types';

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
