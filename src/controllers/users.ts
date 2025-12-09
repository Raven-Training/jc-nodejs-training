import { NextFunction, Request, Response } from 'express';
import status from 'http-status';

import { User } from '../entities/User';
import { notFoundError } from '../errors';
import { createPaginationParams, getValidPage } from '../helpers/pagination.helper';
import { hashPassword } from '../helpers/password.helper';
import { mapLoginResponse } from '../mappers/user.mapper';
import { emailService } from '../services/email';
import * as userService from '../services/users';

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    const page = getValidPage(req.query.page as string);
    const paginationParams = createPaginationParams(page);

    const result = await userService.findAll(paginationParams);

    console.log(`Users retrieved successfully. Page: ${page}, Total: ${result.pagination.total}`);

    return res.status(status.OK).json(result);
  } catch (err) {
    console.error('Database error while fetching users:', err);
    next(err);
  }
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

    emailService.sendWelcomeEmail(user.email, user.name).catch((error) => {
      console.error(`Failed to send welcome email to user ${user.id}:`, error);
    });

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

    return res
      .status(status.OK)
      .json(mapLoginResponse(result.token!, result.user!, result.message!));
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
      return res.status(status.OK).json(user);
    })
    .catch(next);
}

export async function invalidateAllSessions(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    const userId = req.user!.userId;

    await userService.invalidateAllUserSessions(userId);

    console.log(`All sessions invalidated successfully for user ${userId}`);

    return res.status(status.OK).json({
      message: 'All sessions have been invalidated successfully',
    });
  } catch (err) {
    console.error('Error invalidating sessions:', err);
    next(err);
  }
}
