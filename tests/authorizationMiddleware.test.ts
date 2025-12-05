import { Request, Response, NextFunction } from 'express';

import { UserRole } from '../src/types/user.types';
import { generateDatabaseError } from './utils/testGenerators';
import * as userService from '../src/services/users';
import { createRoleMiddleware, requireAdmin } from '../src/middlewares/authorization.middleware';

jest.mock('../src/services/users');

describe('Authorization Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      user: { userId: 123, tokenVersion: 0 },
    };
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('createRoleMiddleware', () => {
    it('should allow access when user has required admin role', async () => {
      (userService.isUserAdmin as jest.Mock).mockResolvedValue(true);

      const middleware = createRoleMiddleware([UserRole.ADMIN]);

      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(userService.isUserAdmin).toHaveBeenCalledWith(123);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should deny access when user has insufficient role', async () => {
      (userService.isUserAdmin as jest.Mock).mockResolvedValue(false);

      const middleware = createRoleMiddleware([UserRole.ADMIN]);

      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(userService.isUserAdmin).toHaveBeenCalledWith(123);
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Insufficient permissions',
          statusCode: 403,
        }),
      );
    });

    it('should deny access when no user is authenticated', async () => {
      mockReq.user = undefined;

      const middleware = createRoleMiddleware([UserRole.ADMIN]);

      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(userService.isUserAdmin).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Authentication required before authorization',
          statusCode: 403,
        }),
      );
    });

    it('should deny access when user ID is missing', async () => {
      mockReq.user = { userId: undefined } as any;

      const middleware = createRoleMiddleware([UserRole.ADMIN]);

      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(userService.isUserAdmin).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Authentication required before authorization',
          statusCode: 403,
        }),
      );
    });

    it('should handle database errors during role verification', async () => {
      const databaseError = generateDatabaseError();
      (userService.isUserAdmin as jest.Mock).mockRejectedValue(databaseError);

      const middleware = createRoleMiddleware([UserRole.ADMIN]);

      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(userService.isUserAdmin).toHaveBeenCalledWith(123);
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Role verification failed',
          statusCode: 403,
        }),
      );
    });

    it('should allow access with multiple allowed roles', async () => {
      (userService.isUserAdmin as jest.Mock).mockResolvedValue(true);

      const middleware = createRoleMiddleware([UserRole.USER, UserRole.ADMIN]);

      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(userService.isUserAdmin).toHaveBeenCalledWith(123);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('requireAdmin', () => {
    it('should allow access for admin users', async () => {
      (userService.isUserAdmin as jest.Mock).mockResolvedValue(true);

      await requireAdmin(mockReq as Request, mockRes as Response, mockNext);

      expect(userService.isUserAdmin).toHaveBeenCalledWith(123);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should deny access for regular users', async () => {
      (userService.isUserAdmin as jest.Mock).mockResolvedValue(false);

      await requireAdmin(mockReq as Request, mockRes as Response, mockNext);

      expect(userService.isUserAdmin).toHaveBeenCalledWith(123);
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Insufficient permissions',
          statusCode: 403,
        }),
      );
    });
  });
});
