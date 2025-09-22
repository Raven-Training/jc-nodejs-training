import { DeepPartial, FindManyOptions, FindOneOptions } from 'typeorm';

import { AppDataSource } from '../data-source';
import { User } from '../entities/User';

const userRepository = AppDataSource.getRepository(User);

export const findUser = (options: FindOneOptions<User>): Promise<User | null> =>
  userRepository.findOne(options);

export function createAndSave(user: User): Promise<User> {
  return userRepository.save(user);
}

export function findAll(options?: FindManyOptions): Promise<User[]> {
  return userRepository.find(options);
}

export function createMany(users: DeepPartial<User>[]): Promise<User[]> {
  return userRepository.save(users);
}
