import { User } from '../src/entities/User';

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
});
