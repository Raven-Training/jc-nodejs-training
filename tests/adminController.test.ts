import 'jest';
import request from 'supertest';

import app from '../src/app';
import { generateToken } from '../src/helpers/jwt.helper';
import { generateAdminUser } from './utils/factories';
import * as userService from '../src/services/users';

jest.mock('../src/services/users');

describe('Admin Controller', () => {
  describe('POST /admin/users', () => {
    const validAdminData = {
      name: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: 'password123',
    };

    let adminToken: string;

    beforeEach(() => {
      jest.clearAllMocks();

      adminToken = generateToken({ userId: 1, tokenVersion: 0 });
    });

    it('should create admin user with valid data and admin authentication', async () => {
      const createdAdminUser = generateAdminUser({
        id: 123,
        ...validAdminData,
      });

      (userService.isUserAdmin as jest.Mock).mockResolvedValue(true);
      (userService.createAdminUser as jest.Mock).mockResolvedValue(createdAdminUser);

      const res = await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validAdminData);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Admin user created successfully');
      expect(res.body.user).toMatchObject({
        id: createdAdminUser.id,
        name: createdAdminUser.name,
        lastName: createdAdminUser.lastName,
        email: createdAdminUser.email,
        role: createdAdminUser.role,
      });
      expect(res.body.user).toHaveProperty('createdAt');
      expect(res.body.user).toHaveProperty('password');
      expect(userService.createAdminUser).toHaveBeenCalledWith(validAdminData);
    });

    it('should return 401 when no authentication token provided', async () => {
      (userService.createAdminUser as jest.Mock).mockResolvedValue(generateAdminUser());

      const res = await request(app).post('/admin/users').send(validAdminData);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
      expect(userService.createAdminUser).not.toHaveBeenCalled();
    });

    it('should return 403 when user is not admin', async () => {
      const regularUserToken = generateToken({ userId: 2, tokenVersion: 0 });

      (userService.isUserAdmin as jest.Mock).mockResolvedValue(false);

      const res = await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send(validAdminData);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message');
      expect(userService.createAdminUser).not.toHaveBeenCalled();
    });

    it('should return 400 when required fields are missing', async () => {
      (userService.isUserAdmin as jest.Mock).mockResolvedValue(true);

      const invalidData = { name: 'Admin' };

      const res = await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation failed');
      expect(res.body).toHaveProperty('errors');
      expect(userService.createAdminUser).not.toHaveBeenCalled();
    });

    it('should return 400 when email format is invalid', async () => {
      (userService.isUserAdmin as jest.Mock).mockResolvedValue(true);

      const invalidEmailData = {
        ...validAdminData,
        email: 'invalid-email',
      };

      const res = await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidEmailData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation failed');
      expect(res.body).toHaveProperty('errors');
      expect(userService.createAdminUser).not.toHaveBeenCalled();
    });

    it('should return 400 when password is too short', async () => {
      (userService.isUserAdmin as jest.Mock).mockResolvedValue(true);

      const shortPasswordData = {
        ...validAdminData,
        password: '123',
      };

      const res = await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(shortPasswordData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Validation failed');
      expect(res.body).toHaveProperty('errors');
      expect(userService.createAdminUser).not.toHaveBeenCalled();
    });

    it('should handle service errors with proper logging', async () => {
      const databaseError = {
        message: 'Database connection failed',
        internalCode: 'DATABASE_ERROR',
        statusCode: 500,
      };

      (userService.isUserAdmin as jest.Mock).mockResolvedValue(true);
      (userService.createAdminUser as jest.Mock).mockRejectedValue(databaseError);

      const res = await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validAdminData);

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('message');
      expect(userService.createAdminUser).toHaveBeenCalledWith(validAdminData);
    });

    it('should update existing user to admin role', async () => {
      const existingUserEmail = 'existing@test.com';
      const existingUserData = {
        ...validAdminData,
        email: existingUserEmail,
      };

      const updatedUser = generateAdminUser({
        id: 456,
        ...existingUserData,
      });

      (userService.isUserAdmin as jest.Mock).mockResolvedValue(true);
      (userService.createAdminUser as jest.Mock).mockResolvedValue(updatedUser);

      const res = await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(existingUserData);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Admin user created successfully');
      expect(res.body.user).toMatchObject({
        id: updatedUser.id,
        name: updatedUser.name,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
      });
      expect(res.body.user).toHaveProperty('createdAt');
      expect(res.body.user).toHaveProperty('password');
      expect(userService.createAdminUser).toHaveBeenCalledWith(existingUserData);
    });

    it('should return 403 when token is malformed', async () => {
      const res = await request(app)
        .post('/admin/users')
        .set('Authorization', 'Bearer invalid-token')
        .send(validAdminData);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message');
      expect(userService.createAdminUser).not.toHaveBeenCalled();
    });
  });
});
