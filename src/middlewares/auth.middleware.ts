import { Request, Response, NextFunction } from 'express';

import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { authenticationError, invalidTokenError } from '../errors';
import { verifyToken } from '../helpers/jwt.helper';

const userRepository = AppDataSource.getRepository(User);

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(authenticationError('Access token required'));
  }

  try {
    const decoded = verifyToken(token);

    const user = await userRepository.findOne({
      where: { id: decoded.userId },
      select: ['id', 'tokenVersion'],
    });

    if (!user) {
      console.warn(`User ${decoded.userId} from token not found in database`);
      return next(invalidTokenError('Session invalid, please log in again'));
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      console.warn(`Token version mismatch detected for user ${decoded.userId}`);
      return next(invalidTokenError('Session invalid, please log in again'));
    }

    req.user = decoded;
    console.log(`User ${decoded.userId} authenticated successfully`);
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    next(invalidTokenError('Invalid or expired token'));
  }
};
