import bcrypt from 'bcrypt';

import { User } from '../src/entities/User';
import { generateUser, generateUserInput } from './utils/factories';

import { createMockRepository } from './__mocks__/repository';

const mockUserRepository = createMockRepository<User>();

jest.mock('../src/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue(mockUserRepository),
  },
}));

jest.mock('bcrypt');

import * as userService from '../src/services/users';

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

      const paginationParams = { page: 1, limit: 10, offset: 0 };
      const result = await userService.findAll(paginationParams, undefined);

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

      const paginationParams = { page: 3, limit: 10, offset: 20 };
      const result = await userService.findAll(paginationParams, undefined);

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

    const generateTestUser = (overrides: Partial<User> = {}) => {
      return generateUser({
        id: 1,
        name: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: hashedPassword,
        ...overrides,
      });
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should authenticate user with valid credentials', async () => {
      const mockUser = generateTestUser();

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await userService.authenticateUser(email, password);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
        select: ['id', 'name', 'lastName', 'email', 'password', 'createdAt'],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toEqual({
        success: true,
        token: expect.any(String),
        user: {
          id: 1,
          name: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          createdAt: expect.any(Date),
        },
        message: 'Login successful',
      });
    });

    it('should return failure for non-existent user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await userService.authenticateUser(email, password);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
        select: ['id', 'name', 'lastName', 'email', 'password', 'createdAt'],
      });
      expect(result).toEqual({
        success: false,
        message: 'Invalid credentials',
      });
    });

    it('should return failure for invalid password', async () => {
      const mockUser = generateTestUser();

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await userService.authenticateUser(email, password);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
        select: ['id', 'name', 'lastName', 'email', 'password', 'createdAt'],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toEqual({
        success: false,
        message: 'Invalid credentials',
      });
    });

    it('should handle database errors', async () => {
      const databaseError = new Error('Database connection failed');
      mockUserRepository.findOne.mockRejectedValue(databaseError);

      await expect(userService.authenticateUser(email, password)).rejects.toThrow(
        'Database connection failed',
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
        select: ['id', 'name', 'lastName', 'email', 'password', 'createdAt'],
      });
    });

    it('should handle bcrypt comparison errors', async () => {
      const mockUser = generateTestUser();

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const bcryptError = new Error('bcrypt comparison failed');
      (bcrypt.compare as jest.Mock).mockRejectedValue(bcryptError);

      await expect(userService.authenticateUser(email, password)).rejects.toThrow(
        'bcrypt comparison failed',
      );

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email },
        select: ['id', 'name', 'lastName', 'email', 'password', 'createdAt'],
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
    });

    it('should exclude password from returned user object', async () => {
      const mockUser = generateTestUser();

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await userService.authenticateUser(email, password);

      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user).not.toHaveProperty('password');
      expect(result.user).toEqual({
        id: 1,
        name: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        createdAt: expect.any(Date),
      });
    });
  });
});
