import { NextFunction, Request, Response } from 'express';
import status from 'http-status';

import * as teamsService from '../services/teams';
import { ICreateTeamRequest, IAddPokemonToTeamRequest } from '../types/teams.types';

export async function createTeam(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    const userId = req.user!.userId;
    const teamData: ICreateTeamRequest = req.body;

    console.info(`Controller - Processing team creation: ${teamData.name} for user ${userId}`);

    const newTeam = await teamsService.createTeam(userId, teamData);

    console.info(`Controller - Team creation successful: ${newTeam.name} for user ${userId}`);

    return res.status(status.CREATED).json({
      message: `Team created successfully`,
      data: newTeam,
    });
  } catch (err) {
    console.error('Controller Error - Failed to create team:', err);
    next(err);
  }
}

export async function addPokemonToTeam(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    const userId = req.user!.userId;
    const teamId = parseInt(req.params.teamId, 10);
    const request: IAddPokemonToTeamRequest = req.body;

    console.info(
      `Controller - Adding ${request.pokemonIds?.length || 0} pokemons to team ${teamId} by user ${userId}`,
    );

    const result = await teamsService.addPokemonsToTeam(userId, teamId, request);

    console.info(
      `Controller - Successfully added ${result.data.addedPokemons.length} pokemons to team ${teamId}`,
    );

    return res.status(status.OK).json({
      message: 'Pokémon added to team successfully',
      data: result,
    });
  } catch (err) {
    console.error(`Controller Error - Failed to add pokemons to team ${req.params.teamId}:`, err);
    next(err);
  }
}
