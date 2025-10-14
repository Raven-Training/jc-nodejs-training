import { User } from '../src/entities/User';
import { generateUser, generateUserInput } from './utils/factories';

import { createMockRepository } from './__mocks__/repository';

const mockUserRepository = createMockRepository<User>();

jest.mock('../src/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue(mockUserRepository),
  },
}));

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
    it('should find all users', async () => {
      const users = [generateUser(), generateUser()];
      mockUserRepository.find.mockResolvedValue(users);

      const result = await userService.findAll();

      expect(mockUserRepository.find).toHaveBeenCalled();
      expect(result).toEqual(users);
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
});
