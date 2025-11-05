import bcrypt from 'bcrypt';

import { User } from '../src/entities/User';
import { UserRole } from '../src/types/user.types';
import { generateUser, generateUserInput, generateAdminUser } from './utils/factories';
import {
  generateTestUser,
  generateExpectedUserResponse,
  generatePaginationParams,
  generateDatabaseError,
  generateBcryptError,
  generateExpectedLoginResult,
  generateExpectedFailureResult,
  generateAdminUserData,
} from './utils/testGenerators';

import { createMockRepository } from './__mocks__/repository';

const mockUserRepository = createMockRepository<User>();

jest.mock('../src/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue(mockUserRepository),
  },
}));

jest.mock('bcrypt');
jest.mock('../src/helpers/password.helper');

import * as userService from '../src/services/users';
import { hashPassword } from '../src/helpers/password.helper';

describe('User Service (mock typeorm)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUser', () => {
    it('should find a user by options', async () => {
      const userId = 1;
      const fakeUser = generateUser({ id: userId });
      mockUserRepository.findOne.mockResolvedValue(fakeUser);

      const result = await userService.findUser({ where: { id: userId } });

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(result).toEqual(fakeUser);
    });
  });

  describe('createAndSave', () => {
    it('should create and save a user', async () => {
      const newUser = generateUser();
      mockUserRepository.save.mockResolvedValue(newUser);

      const result = await userService.createAndSave(newUser);

      expect(mockUserRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });
  });

  describe('findAll', () => {
    it('should return paginated users with metadata', async () => {
      const users = [generateUser(), generateUser()];
      const total = 25;
      mockUserRepository.findAndCount.mockResolvedValue([users, total]);

      const paginationParams = generatePaginationParams(1, 10);
      const result = await userService.findAll(paginationParams);

      expect(mockUserRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({
        data: users,
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
      });
    });

    it('should handle last page correctly with pagination', async () => {
      const users = [generateUser()];
      const total = 21;
      mockUserRepository.findAndCount.mockResolvedValue([users, total]);

      const paginationParams = generatePaginationParams(3, 10);
      const result = await userService.findAll(paginationParams);

      expect(result.pagination).toEqual({
        page: 3,
        limit: 10,
        total: 21,
        totalPages: 3,
        hasNext: false,
        hasPrev: true,
      });
    });
  });

  describe('createMany', () => {
    it('should create many users', async () => {
      const userInputs = [generateUserInput(), generateUserInput()];
      const savedUsers = userInputs.map((input, index) =>
        generateUser({
          id: index + 1,
          name: input.name,
          lastName: input.lastName,
          email: input.email,
        }),
      );
      mockUserRepository.save.mockResolvedValue(savedUsers);

      const result = await userService.createMany(userInputs);

      expect(mockUserRepository.save).toHaveBeenCalledWith(userInputs);
      expect(result).toEqual(savedUsers);
    });
  });

  describe('authenticateUser', () => {
    const email = 'john@test.com';
    const password = 'password123';
    const hashedPassword = '$2b$10$hashedPassword';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should authenticate user with valid credentials', async () => {
      const hashedPassword = 'hashedPassword123';
      const mockUser = generateUser({ email, password: hashedPassword });

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await userService.authenticateUser(email, password);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
        select: ['id', 'name', 'lastName', 'email', 'password', 'role', 'createdAt'],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toEqual(generateExpectedLoginResult());
    });

    it('should return failure for non-existent user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await userService.authenticateUser(email, password);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
        select: ['id', 'name', 'lastName', 'email', 'password', 'role', 'createdAt'],
      });
      expect(result).toEqual(generateExpectedFailureResult());
    });

    it('should return failure for invalid password', async () => {
      const mockUser = generateTestUser(hashedPassword);

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await userService.authenticateUser(email, password);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
        select: ['id', 'name', 'lastName', 'email', 'password', 'role', 'createdAt'],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toEqual(generateExpectedFailureResult());
    });

    it('should handle database errors', async () => {
      const databaseError = generateDatabaseError();
      mockUserRepository.findOne.mockRejectedValue(databaseError);

      await expect(userService.authenticateUser(email, password)).rejects.toThrow(
        'Database connection failed',
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
        select: ['id', 'name', 'lastName', 'email', 'password', 'role', 'createdAt'],
      });
    });

    it('should handle bcrypt comparison errors', async () => {
      const mockUser = generateTestUser(hashedPassword);

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const bcryptError = generateBcryptError();
      (bcrypt.compare as jest.Mock).mockRejectedValue(bcryptError);

      await expect(userService.authenticateUser(email, password)).rejects.toThrow(
        'bcrypt comparison failed',
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
        select: ['id', 'name', 'lastName', 'email', 'password', 'role', 'createdAt'],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should exclude password from returned user object', async () => {
      const mockUser = generateTestUser(hashedPassword);

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await userService.authenticateUser(email, password);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toEqual(generateExpectedUserResponse());
    });
  });

  describe('Admin User Functions', () => {
    describe('createAdminUser', () => {
      const adminUserData = generateAdminUserData();

      beforeEach(() => {
        (hashPassword as jest.Mock).mockResolvedValue('hashedPassword123');
      });

      it('should create a new admin user when email does not exist', async () => {
        const expectedAdminUser = generateAdminUser({
          ...adminUserData,
          password: 'hashedPassword123',
        });

        mockUserRepository.findOne.mockResolvedValue(null);
        mockUserRepository.create.mockReturnValue(expectedAdminUser);
        mockUserRepository.save.mockResolvedValue(expectedAdminUser);

        const result = await userService.createAdminUser(adminUserData);

        expect(mockUserRepository.findOne).toHaveBeenCalledWith({
          where: { email: adminUserData.email },
        });
        expect(hashPassword).toHaveBeenCalledWith(adminUserData.password);
        expect(mockUserRepository.create).toHaveBeenCalledWith({
          name: adminUserData.name,
          lastName: adminUserData.lastName,
          email: adminUserData.email,
          password: 'hashedPassword123',
          role: UserRole.ADMIN,
        });
        expect(mockUserRepository.save).toHaveBeenCalledWith(expectedAdminUser);
        expect(result).toEqual({
          id: expectedAdminUser.id,
          name: expectedAdminUser.name,
          lastName: expectedAdminUser.lastName,
          email: expectedAdminUser.email,
          role: expectedAdminUser.role,
          createdAt: expectedAdminUser.createdAt,
        });
        expect(result).not.toHaveProperty('password');
      });

      it('should update existing user to admin when email already exists', async () => {
        const existingUser = generateUser({ email: adminUserData.email });
        const updatedAdminUser = { ...existingUser, role: UserRole.ADMIN };

        mockUserRepository.findOne.mockResolvedValue(existingUser);
        mockUserRepository.save.mockResolvedValue(updatedAdminUser);

        const result = await userService.createAdminUser(adminUserData);

        expect(mockUserRepository.findOne).toHaveBeenCalledWith({
          where: { email: adminUserData.email },
        });
        expect(hashPassword).not.toHaveBeenCalled();
        expect(mockUserRepository.create).not.toHaveBeenCalled();
        expect(mockUserRepository.save).toHaveBeenCalledWith({
          ...existingUser,
          role: UserRole.ADMIN,
        });
        expect(result).toEqual({
          id: updatedAdminUser.id,
          name: updatedAdminUser.name,
          lastName: updatedAdminUser.lastName,
          email: updatedAdminUser.email,
          role: updatedAdminUser.role,
          createdAt: updatedAdminUser.createdAt,
        });
        expect(result).not.toHaveProperty('password');
      });

      it('should handle database errors during user creation', async () => {
        const databaseError = generateDatabaseError();

        mockUserRepository.findOne.mockResolvedValue(null);
        mockUserRepository.create.mockReturnValue(generateAdminUser());
        mockUserRepository.save.mockRejectedValue(databaseError);

        await expect(userService.createAdminUser(adminUserData)).rejects.toThrow(
          'Database connection failed',
        );

        expect(mockUserRepository.findOne).toHaveBeenCalledWith({
          where: { email: adminUserData.email },
        });
        expect(hashPassword).toHaveBeenCalledWith(adminUserData.password);
      });

      it('should handle database errors during user update', async () => {
        const existingUser = generateUser({ email: adminUserData.email });
        const databaseError = generateDatabaseError();

        mockUserRepository.findOne.mockResolvedValue(existingUser);
        mockUserRepository.save.mockRejectedValue(databaseError);

        await expect(userService.createAdminUser(adminUserData)).rejects.toThrow(
          'Database connection failed',
        );

        expect(mockUserRepository.findOne).toHaveBeenCalledWith({
          where: { email: adminUserData.email },
        });
      });

      it('should handle password hashing errors', async () => {
        const hashingError = new Error('Password hashing failed');

        mockUserRepository.findOne.mockResolvedValue(null);
        (hashPassword as jest.Mock).mockRejectedValue(hashingError);

        await expect(userService.createAdminUser(adminUserData)).rejects.toThrow(
          'Password hashing failed',
        );

        expect(mockUserRepository.findOne).toHaveBeenCalledWith({
          where: { email: adminUserData.email },
        });
        expect(hashPassword).toHaveBeenCalledWith(adminUserData.password);
      });
    });

    describe('isUserAdmin', () => {
      const userId = 123;

      it('should return true when user has admin role', async () => {
        const adminUser = generateAdminUser({ id: userId });

        mockUserRepository.findOne.mockResolvedValue(adminUser);

        const result = await userService.isUserAdmin(userId);

        expect(mockUserRepository.findOne).toHaveBeenCalledWith({
          where: { id: userId },
          select: ['role'],
        });
        expect(result).toBe(true);
      });

      it('should return false when user has regular role', async () => {
        const regularUser = generateUser({ id: userId, role: UserRole.USER });

        mockUserRepository.findOne.mockResolvedValue(regularUser);

        const result = await userService.isUserAdmin(userId);

        expect(mockUserRepository.findOne).toHaveBeenCalledWith({
          where: { id: userId },
          select: ['role'],
        });
        expect(result).toBe(false);
      });

      it('should return false when user does not exist', async () => {
        mockUserRepository.findOne.mockResolvedValue(null);

        const result = await userService.isUserAdmin(userId);

        expect(mockUserRepository.findOne).toHaveBeenCalledWith({
          where: { id: userId },
          select: ['role'],
        });
        expect(result).toBe(false);
      });

      it('should handle database errors during role check', async () => {
        const databaseError = generateDatabaseError();
        mockUserRepository.findOne.mockRejectedValue(databaseError);

        await expect(userService.isUserAdmin(userId)).rejects.toThrow('Database connection failed');

        expect(mockUserRepository.findOne).toHaveBeenCalledWith({
          where: { id: userId },
          select: ['role'],
        });
      });
    });
  });
});
