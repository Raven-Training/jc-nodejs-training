import bcrypt from 'bcrypt';
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

export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await userService.registerUser({ ...req.body, password: hashedPassword });
    console.log(`User ${user.name} registered successfully.`);
    return res.status(status.CREATED).json({ user });
  } catch (err) {
    console.error('Error registering user:', err);
    next(err);
  }
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
