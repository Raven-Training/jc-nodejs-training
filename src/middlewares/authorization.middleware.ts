import { Request, Response, NextFunction } from 'express';

import { authorizationError } from '../errors';
import * as userService from '../services/users';
import { UserRole } from '../types/user.types';

export const createRoleMiddleware = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.userId) {
        return next(authorizationError('Authentication required before authorization'));
      }

      const isAdmin = await userService.isUserAdmin(req.user.userId);
      const userRole = isAdmin ? UserRole.ADMIN : UserRole.USER;

      if (!allowedRoles.includes(userRole)) {
        console.log(
          `Access denied: User ${req.user.userId} with role ${userRole} attempted action requiring roles: ${allowedRoles.join(', ')}`,
        );
        return next(authorizationError(`Required roles: ${allowedRoles.join(', ')}`));
      }

      console.log(`Role-based access granted to user ${req.user.userId} with role ${userRole}`);
      next();
    } catch (error) {
      console.error(`Role authorization error for user ${req.user?.userId}:`, error);
      next(authorizationError('Role verification failed'));
    }
  };
};

export const requireAdmin = createRoleMiddleware([UserRole.ADMIN]);
