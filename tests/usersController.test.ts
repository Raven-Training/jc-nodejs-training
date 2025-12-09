import 'jest';
import request from 'supertest';

import app from '../src/app';
import { User } from '../src/entities/User';
import { generateToken } from '../src/helpers/jwt.helper';
import { UserRole } from '../src/types/user.types';
import * as userService from '../src/services/users';
import { generateUser, generateUserInput, generateInvalidPassword } from './utils/factories';
import {
  generatePaginatedResponse,
  generatePaginationMetadata,
  generateSuccessfulLoginResponse,
  generateFailedLoginResponse,
  generateInvalidLoginCredentials,
  generateDatabaseError,
} from './utils/testGenerators';

jest.mock('../src/services/users');

describe('Users Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('should return paginated users when GET /users is called', async () => {
      const mockUsers: User[] = [generateUser()];
      const mockPaginatedResponse = generatePaginatedResponse(
        mockUsers,
        generatePaginationMetadata(1, 10, 1),
      );
      const token = generateToken({ userId: 1, tokenVersion: 0 });
      (userService.findAll as jest.Mock).mockResolvedValue(mockPaginatedResponse);

      const res = await request(app).get('/users').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        data: mockUsers.map((user) => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
        })),
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });
      expect(userService.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        offset: 0,
      });
    });

    it('should handle custom page parameter but fixed limit', async () => {
      const mockUsers: User[] = [generateUser(), generateUser()];
      const mockPaginatedResponse = generatePaginatedResponse(
        mockUsers,
        generatePaginationMetadata(2, 10, 25),
      );
      const token = generateToken({ userId: 1, tokenVersion: 0 });
      (userService.findAll as jest.Mock).mockResolvedValue(mockPaginatedResponse);
      const res = await request(app)
        .get('/users?page=2&limit=5')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
      });
      expect(userService.findAll).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
        offset: 10,
      });
    });

    it('should handle database errors with proper logging', async () => {
      const token = generateToken({ userId: 1, tokenVersion: 0 });
      const databaseError = generateDatabaseError();
      (userService.findAll as jest.Mock).mockRejectedValue(databaseError);

      const res = await request(app).get('/users').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(userService.findAll).toHaveBeenCalled();
    });
  });

  describe('POST /users (Registration)', () => {
    it('should create and return a user when POST /users is called with valid data', async () => {
      const newUser = generateUserInput();
      const createdUser = generateUser({
        name: newUser.name,
        lastName: newUser.lastName,
        email: newUser.email,
        password: 'hashedPassword123',
      });

      jest.spyOn(userService, 'registerUser').mockResolvedValue(createdUser);

      const res = await request(app).post('/users').send(newUser);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        user: {
          id: createdUser.id,
          name: createdUser.name,
          lastName: createdUser.lastName,
          email: createdUser.email,
          role: createdUser.role,
          tokenVersion: createdUser.tokenVersion,
          createdAt: createdUser.createdAt.toISOString(),
        },
      });
      expect(userService.registerUser).toHaveBeenCalledWith({
        ...newUser,
        password: expect.any(String),
      });
    });

    it('should successfully register user and return 201 status', async () => {
      const newUser = generateUserInput();
      const createdUser = generateUser({
        name: newUser.name,
        lastName: newUser.lastName,
        email: newUser.email,
      });

      jest.spyOn(userService, 'registerUser').mockResolvedValue(createdUser);

      const res = await request(app).post('/users').send(newUser);

      expect(res.status).toBe(201);
      expect(userService.registerUser).toHaveBeenCalledWith({
        ...newUser,
        password: expect.any(String),
      });
    });

    it('should complete registration successfully', async () => {
      const newUser = generateUserInput();
      const createdUser = generateUser({
        name: newUser.name,
        lastName: newUser.lastName,
        email: newUser.email,
      });

      jest.spyOn(userService, 'registerUser').mockResolvedValue(createdUser);

      const res = await request(app).post('/users').send(newUser);

      expect(res.status).toBe(201);
      expect(res.body.user).toEqual({
        id: createdUser.id,
        name: createdUser.name,
        lastName: createdUser.lastName,
        email: createdUser.email,
        role: createdUser.role,
        tokenVersion: createdUser.tokenVersion,
        createdAt: createdUser.createdAt.toISOString(),
      });
    });

    it('should return 409 if the email already exists', async () => {
      const newUser = generateUserInput();
      const existingUser = generateUser({
        email: newUser.email,
      });

      jest.spyOn(userService, 'findUser').mockResolvedValue(existingUser);

      const res = await request(app).post('/users').send(newUser);

      expect(res.status).toBe(409);
      expect(res.body).toEqual({
        message: 'Email already exists',
        field: 'email',
      });
      expect(userService.findUser).toHaveBeenCalledWith({
        where: { email: newUser.email },
      });
    });

    it('should return 400 if password does not meet restrictions', async () => {
      const invalidUser = generateUserInput({
        password: generateInvalidPassword(),
      });

      const res = await request(app).post('/users').send(invalidUser);

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Password must be at least 8 characters long',
          }),
        ]),
      );
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidUser = generateUserInput();
      delete (invalidUser as any).name;
      delete (invalidUser as any).lastName;
      delete (invalidUser as any).password;

      const res = await request(app).post('/users').send(invalidUser);

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ msg: 'Name is required' }),
          expect.objectContaining({ msg: 'Last name is required' }),
          expect.objectContaining({ msg: 'Password must be at least 8 characters long' }),
        ]),
      );
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user when GET /users/:id is called with valid id', async () => {
      const userId = 3;
      const token = generateToken({ userId: 1, tokenVersion: 0 });
      const foundUser = generateUser({ id: userId });
      (userService.findUser as jest.Mock).mockResolvedValue(foundUser);

      const res = await request(app)
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ...foundUser,
        createdAt: foundUser.createdAt.toISOString(),
      });
      expect(userService.findUser).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should return 404 if user is not found when GET /users/:id is called', async () => {
      const token = generateToken({ userId: 1, tokenVersion: 0 });
      (userService.findUser as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/users/999').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'User not found');
    });
  });

  describe('Token Authentication', () => {
    it('should return 401 when GET /users is called without token', async () => {
      const res = await request(app).get('/users');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Access token required');
      expect(res.body).toHaveProperty('internal_code', 'authentication_error');
    });

    it('should return 401 when GET /users/:id is called without token', async () => {
      const res = await request(app).get('/users/1');
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Access token required');
      expect(res.body).toHaveProperty('internal_code', 'authentication_error');
    });

    it('should return 403 when GET /users is called with invalid token', async () => {
      const res = await request(app).get('/users').set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message', 'Invalid or expired token');
      expect(res.body).toHaveProperty('internal_code', 'invalid_token_error');
    });
  });

  describe('POST /users/login', () => {
    const loginCredentials = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should login user with valid credentials', async () => {
      const mockUser = {
        id: 1,
        name: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: UserRole.USER,
        tokenVersion: 0,
        createdAt: new Date(),
      };
      const mockLoginResult = generateSuccessfulLoginResponse('jwt-token-here', mockUser);

      jest.spyOn(userService, 'authenticateUser').mockResolvedValue(mockLoginResult);

      const res = await request(app).post('/users/login').send(loginCredentials);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: 'Login successful',
        token: 'jwt-token-here',
        user: {
          id: 1,
          name: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: UserRole.USER,
          createdAt: mockUser.createdAt.toISOString(),
        },
      });
      expect(userService.authenticateUser).toHaveBeenCalledWith(
        loginCredentials.email,
        loginCredentials.password,
      );
    });

    it('should return 401 for invalid credentials', async () => {
      const mockLoginResult = generateFailedLoginResponse();

      jest.spyOn(userService, 'authenticateUser').mockResolvedValue(mockLoginResult);

      const res = await request(app).post('/users/login').send(loginCredentials);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        message: 'Invalid credentials',
      });
      expect(userService.authenticateUser).toHaveBeenCalledWith(
        loginCredentials.email,
        loginCredentials.password,
      );
    });

    it('should handle service errors during login', async () => {
      const error = generateDatabaseError();
      jest.spyOn(userService, 'authenticateUser').mockRejectedValue(error);

      const res = await request(app).post('/users/login').send(loginCredentials);

      expect(res.status).toBe(500);
      expect(userService.authenticateUser).toHaveBeenCalledWith(
        loginCredentials.email,
        loginCredentials.password,
      );
    });

    it('should fail validation with invalid email format', async () => {
      const invalidCredentials = generateInvalidLoginCredentials('email');

      const res = await request(app).post('/users/login').send(invalidCredentials);

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Invalid email format',
          }),
        ]),
      );
    });
  });

  describe('POST /users/sessions/invalidate_all', () => {
    it('should invalidate all sessions for authenticated user', async () => {
      const userId = 1;
      const token = generateToken({ userId, tokenVersion: 0 });

      (userService.invalidateAllUserSessions as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app)
        .post('/users/sessions/invalidate_all')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: 'All sessions have been invalidated successfully',
      });
      expect(userService.invalidateAllUserSessions).toHaveBeenCalledWith(userId);
    });

    it('should return 401 when no authentication token provided', async () => {
      const res = await request(app).post('/users/sessions/invalidate_all');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
      expect(userService.invalidateAllUserSessions).not.toHaveBeenCalled();
    });

    it('should return 403 when token is invalid', async () => {
      const invalidToken = 'invalid-token';

      const res = await request(app)
        .post('/users/sessions/invalidate_all')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message');
      expect(userService.invalidateAllUserSessions).not.toHaveBeenCalled();
    });

    it('should handle service errors during invalidation', async () => {
      const userId = 1;
      const token = generateToken({ userId, tokenVersion: 0 });
      const databaseError = generateDatabaseError();

      (userService.invalidateAllUserSessions as jest.Mock).mockRejectedValue(databaseError);

      const res = await request(app)
        .post('/users/sessions/invalidate_all')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(userService.invalidateAllUserSessions).toHaveBeenCalledWith(userId);
    });

    it('should handle user not found error', async () => {
      const userId = 999;
      const token = generateToken({ userId, tokenVersion: 0 });

      (userService.invalidateAllUserSessions as jest.Mock).mockRejectedValue(
        new Error('User with id 999 not found'),
      );

      const res = await request(app)
        .post('/users/sessions/invalidate_all')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(userService.invalidateAllUserSessions).toHaveBeenCalledWith(userId);
    });

    it('should invalidate sessions for different users independently', async () => {
      const user1Id = 1;
      const user2Id = 2;
      const token1 = generateToken({ userId: user1Id, tokenVersion: 0 });
      const token2 = generateToken({ userId: user2Id, tokenVersion: 0 });

      (userService.invalidateAllUserSessions as jest.Mock).mockResolvedValue(undefined);

      const res1 = await request(app)
        .post('/users/sessions/invalidate_all')
        .set('Authorization', `Bearer ${token1}`);

      expect(res1.status).toBe(200);
      expect(userService.invalidateAllUserSessions).toHaveBeenCalledWith(user1Id);

      const res2 = await request(app)
        .post('/users/sessions/invalidate_all')
        .set('Authorization', `Bearer ${token2}`);

      expect(res2.status).toBe(200);
      expect(userService.invalidateAllUserSessions).toHaveBeenCalledWith(user2Id);
    });
  });
});
