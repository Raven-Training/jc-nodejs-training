import 'jest';
import request from 'supertest';

import app from '../src/app';
import { User } from '../src/entities/User';
import { generateToken } from '../src/helpers/jwt.helper';
import * as userService from '../src/services/users';

jest.mock('../src/services/users');

describe('Users Controller', () => {
  // Helper para generar token válido para tests
  const getValidToken = () => generateToken({ userId: 1 });
  const authHeader = () => `Bearer ${getValidToken()}`;
  it('GET /users returns users from the service', async () => {
    const mockUsers: User[] = [{ id: 1, name: 'Alice', email: 'alice@example.com' } as User];
    (userService.findAll as jest.Mock).mockResolvedValue(mockUsers);

    const res = await request(app)
      .get('/users')
      .set('Authorization', authHeader());
    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockUsers);
    expect(userService.findAll).toHaveBeenCalled();
  });

  it('POST /users creates a user via the service', async () => {
    const newUser = {
      name: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    const createdUser = {
      id: 1,
      name: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'hashedPassword123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

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
        updatedAt: createdUser.updatedAt.toISOString(),
      },
    });
    expect(userService.registerUser).toHaveBeenCalledWith({
      ...newUser,
      password: expect.any(String),
    });
  });

  it('POST /users fails if the email is already in use', async () => {
    const newUser = {
      name: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    jest.spyOn(userService, 'findUser').mockResolvedValue({
      id: 1,
      name: 'Existing',
      lastName: 'User',
      email: 'john@example.com',
      password: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User);

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

  it('POST /users fails if the password does not meet restrictions', async () => {
    const invalidUser = {
      name: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'short',
    };

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

  it('POST /users fails if required parameters are missing', async () => {
    const invalidUser = { email: 'john@example.com' };

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

  it('GET /users/:id returns a user if found', async () => {
    const foundUser = { id: 3, name: 'Carol', email: 'carol@example.com' } as User;
    (userService.findUser as jest.Mock).mockResolvedValue(foundUser);

    const res = await request(app)
      .get('/users/3')
      .set('Authorization', authHeader());
    expect(res.status).toBe(200);
    expect(res.body).toEqual(foundUser);
    expect(userService.findUser).toHaveBeenCalledWith({ where: { id: 3 } });
  });

  it('GET /users/:id returns 404 if user not found', async () => {
    (userService.findUser as jest.Mock).mockResolvedValue(null);

    const res = await request(app)
      .get('/users/999')
      .set('Authorization', authHeader());
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'User not found');
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
