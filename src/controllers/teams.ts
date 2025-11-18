import { NextFunction, Request, Response } from 'express';
import status from 'http-status';

import * as teamsService from '../services/teams';
import { ICreateTeamRequest } from '../types/teams.types';

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
