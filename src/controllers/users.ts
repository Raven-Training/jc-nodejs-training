import { NextFunction, Request, Response } from 'express';
import status from 'http-status';

import { User } from '../entities/User';
import { notFoundError } from '../errors';
import { hashPassword } from '../helpers/password.helper';
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
    const hashedPassword = await hashPassword(req.body.password);
    const user = await userService.registerUser({ ...req.body, password: hashedPassword });

    console.log(`User ${user.name} registered successfully.`);

    const { password: _password, ...userWithoutPassword } = user;
    return res.status(status.CREATED).json({ user: userWithoutPassword });
  } catch (err) {
    console.error('Error registering user:', err);
    next(err);
  }
}

export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    const { email, password } = req.body;
    const result = await userService.authenticateUser(email, password);

    if (!result.success) {
      return res.status(status.UNAUTHORIZED).json({ message: result.message });
    }

    return res.status(status.OK).json({
      message: result.message,
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    console.error('Error during login:', err);
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
