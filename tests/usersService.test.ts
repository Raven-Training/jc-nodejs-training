import bcrypt from 'bcrypt';

import { User } from '../src/entities/User';

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

  it('should find a user by options', async () => {
    const fakeUser: User = { id: 1, name: 'John', email: 'john@test.com' } as User;
    mockUserRepository.findOne.mockResolvedValue(fakeUser);

    const result = await userService.findUser({ where: { id: 1 } });

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toEqual(fakeUser);
  });

  it('should create and save a user', async () => {
    const newUser: User = { id: 2, name: 'Jane', email: 'jane@test.com' } as User;
    mockUserRepository.save.mockResolvedValue(newUser);

    const result = await userService.createAndSave(newUser);

    expect(mockUserRepository.save).toHaveBeenCalledWith(newUser);
    expect(result).toEqual(newUser);
  });

  it('should find all users', async () => {
    const users: User[] = [
      { id: 1, name: 'John', email: 'john@test.com' } as User,
      { id: 2, name: 'Jane', email: 'jane@test.com' } as User,
    ];
    mockUserRepository.find.mockResolvedValue(users);

    const result = await userService.findAll();

    expect(mockUserRepository.find).toHaveBeenCalled();
    expect(result).toEqual(users);
  });

  it('should create many users', async () => {
    const users: Partial<User>[] = [
      { name: 'John', email: 'john@test.com' },
      { name: 'Jane', email: 'jane@test.com' },
    ];
    const savedUsers: User[] = [
      { id: 1, name: 'John', email: 'john@test.com' } as User,
      { id: 2, name: 'Jane', email: 'jane@test.com' } as User,
    ];
    mockUserRepository.save.mockResolvedValue(savedUsers);

    const result = await userService.createMany(users);

    expect(mockUserRepository.save).toHaveBeenCalledWith(users);
    expect(result).toEqual(savedUsers);
  });

  describe('authenticateUser', () => {
    const email = 'john@test.com';
    const password = 'password123';
    const hashedPassword = '$2b$10$hashedPassword';

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should authenticate user with valid credentials', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: hashedPassword,
        createdAt: new Date(),
      } as User;

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
      const mockUser: User = {
        id: 1,
        name: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: hashedPassword,
        createdAt: new Date(),
      } as User;

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
      const mockUser: User = {
        id: 1,
        name: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: hashedPassword,
        createdAt: new Date(),
      } as User;

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
      const mockUser: User = {
        id: 1,
        name: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: hashedPassword,
        createdAt: new Date(),
      } as User;

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
