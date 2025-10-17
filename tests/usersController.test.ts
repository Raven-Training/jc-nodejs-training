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
    it('should return all users when GET /users is called', async () => {
      const mockUsers: User[] = [generateUser()];
      (userService.findAll as jest.Mock).mockResolvedValue(mockUsers);

      const res = await request(app).get('/users');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        mockUsers.map((user) => ({
          ...user,
          createdAt: user.createdAt.toISOString(),
        })),
      );
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
      const foundUser = generateUser({ id: userId });
      (userService.findUser as jest.Mock).mockResolvedValue(foundUser);

      const res = await request(app).get(`/users/${userId}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ...foundUser,
        createdAt: foundUser.createdAt.toISOString(),
      });
      expect(userService.findUser).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should return 404 if user is not found when GET /users/:id is called', async () => {
      (userService.findUser as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/users/999');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'User not found');
    });
  });

  it('GET /users returns 401 without token', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Access token required');
    expect(res.body).toHaveProperty('internal_code', 'authentication_error');
  });

  it('GET /users/:id returns 401 without token', async () => {
    const res = await request(app).get('/users/1');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Access token required');
    expect(res.body).toHaveProperty('internal_code', 'authentication_error');
  });

  it('GET /users returns 403 with invalid token', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message', 'Invalid or expired token');
    expect(res.body).toHaveProperty('internal_code', 'invalid_token_error');
  });
});
