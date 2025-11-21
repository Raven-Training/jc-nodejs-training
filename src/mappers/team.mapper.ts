import { Team } from '../entities/Team';
import { TeamResponse } from '../types/teams.types';

export const mapTeamToResponse = (team: Team): TeamResponse => ({
  id: team.id,
  name: team.name,
  teamType: team.teamType,
  createdAt: team.createdAt,
  updatedAt: team.updatedAt,
});
