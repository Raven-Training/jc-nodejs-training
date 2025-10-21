import 'jest';
import request from 'supertest';

import app from '../src/app';
import { User } from '../src/entities/User';
import { generateToken } from '../src/helpers/jwt.helper';
import * as userService from '../src/services/users';
import { generateUser, generateUserInput, generateInvalidPassword } from './utils/factories';

jest.mock('../src/services/users');

describe('Users Controller', () => {
  describe('GET /users', () => {
    it('should return paginated users when GET /users is called', async () => {
      const mockUsers: User[] = [generateUser()];
      const mockPaginatedResponse = {
        data: mockUsers,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };
      const token = generateToken({ userId: 1 });
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
      expect(userService.findAll).toHaveBeenCalledWith(
        {
          page: 1,
          limit: 10,
          offset: 0,
        },
        undefined,
      );
    });

    it('should handle custom page parameter but fixed limit', async () => {
      const mockUsers: User[] = [generateUser(), generateUser()];
      const mockPaginatedResponse = {
        data: mockUsers,
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: true,
        },
      };
      const token = generateToken({ userId: 1 });
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
      expect(userService.findAll).toHaveBeenCalledWith(
        {
          page: 2,
          limit: 10,
          offset: 10,
        },
        undefined,
      );
    });

    it('should handle database errors with proper logging', async () => {
      const token = generateToken({ userId: 1 });
      const databaseError = new Error('Database connection failed');
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
          createdAt: createdUser.createdAt.toISOString(),
        },
      });
      expect(userService.registerUser).toHaveBeenCalledWith({
        ...newUser,
        password: expect.any(String),
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
      const token = generateToken({ userId: 1 });
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
      const token = generateToken({ userId: 1 });
      (userService.findUser as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/users/999').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'User not found');
    });
  });

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
        createdAt: new Date(),
      };

      const mockLoginResult = {
        success: true,
        token: 'jwt-token-here',
        user: mockUser,
        message: 'Login successful',
      };

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
          createdAt: mockUser.createdAt.toISOString(), // JSON serializa Date como string
        },
      });
      expect(userService.authenticateUser).toHaveBeenCalledWith(
        loginCredentials.email,
        loginCredentials.password,
      );
    });

    it('should return 401 for invalid credentials', async () => {
      const mockLoginResult = {
        success: false,
        message: 'Invalid credentials',
      };

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
      const error = new Error('Database connection failed');
      jest.spyOn(userService, 'authenticateUser').mockRejectedValue(error);

      const res = await request(app).post('/users/login').send(loginCredentials);

      expect(res.status).toBe(500);
      expect(userService.authenticateUser).toHaveBeenCalledWith(
        loginCredentials.email,
        loginCredentials.password,
      );
    });

    it('should fail validation with invalid email format', async () => {
      const invalidCredentials = {
        email: 'invalid-email',
        password: 'password123',
      };

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

    it('should fail validation with missing password', async () => {
      const invalidCredentials = {
        email: 'john@example.com',
      };

      const res = await request(app).post('/users/login').send(invalidCredentials);

      expect(res.status).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Password is required',
          }),
        ]),
      );
    });

    it('should fail validation with missing email', async () => {
      const invalidCredentials = {
        password: 'password123',
      };

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
});
