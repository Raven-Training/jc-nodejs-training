import { NextFunction, Request, Response } from 'express';
import status from 'http-status';

import { User } from '../entities/User';
import { notFoundError } from '../errors';
import * as userService from '../services/users';

export function getUsers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  return userService
    .findAll()
    .then((users: User[]) => res.send(users))
    .catch(next);
}

export function createUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  return userService
    .createAndSave(req.body as User)
    .then((user: User) => res.status(status.CREATED).send({ user }))
    .catch(next);
}

export function getUserById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  return userService
    .findUser({ where: { id: Number(req.params.id) } })
    .then((user: User | null) => {
      if (!user) {
        throw notFoundError('User not found');
      }
      return res.send(user);
    })
    .catch(next);
}
