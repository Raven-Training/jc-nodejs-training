import { ObjectLiteral, Repository } from 'typeorm';

type MockRepository<T extends ObjectLiteral = any> = {
  [P in keyof Repository<T>]: jest.Mock;
};

export const createMockRepository = <T extends ObjectLiteral = any>(): MockRepository<T> =>
  ({
    findOne: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAndCount: jest.fn(),
  }) as unknown as MockRepository<T>;
