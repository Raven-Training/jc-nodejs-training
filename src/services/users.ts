import bcrypt from 'bcrypt';
import { DeepPartial, FindManyOptions, FindOneOptions } from 'typeorm';

import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { generateToken } from '../helpers/jwt.helper';
import { calculatePaginationMetadata } from '../helpers/pagination.helper';
import { hashPassword } from '../helpers/password.helper';
import { LoginResult } from '../types/auth.types';
import { PaginationParams, PaginatedResponse } from '../types/pagination.types';
import { UserRole, CreateAdminUserRequest, UserWithRole } from '../types/user.types';

const userRepository = AppDataSource.getRepository(User);

const USER_AUTH_FIELDS: (keyof User)[] = [
  'id',
  'name',
  'lastName',
  'email',
  'password',
  'role',
  'createdAt',
];

export const findUser = (options: FindOneOptions<User>): Promise<User | null> =>
  userRepository.findOne(options);

export const findUserByEmailWithPassword = (email: string): Promise<User | null> =>
  userRepository.findOne({
    where: { email },
    select: USER_AUTH_FIELDS,
  });

export function createAndSave(user: User): Promise<User> {
  return userRepository.save(user);
}

export async function findAll(
  paginationParams: PaginationParams,
  options?: FindManyOptions<User>,
): Promise<PaginatedResponse<User>> {
  const { page, limit, offset } = paginationParams;

  const findOptions: FindManyOptions<User> = {
    ...options,
    skip: offset,
    take: limit,
    order: { createdAt: 'DESC' },
  };

  const [users, total] = await userRepository.findAndCount(findOptions);
  const pagination = calculatePaginationMetadata(page, limit, total);

  return {
    data: users,
    pagination,
  };
}

export function createMany(users: DeepPartial<User>[]): Promise<User[]> {
  return userRepository.save(users);
}

export function registerUser(user: User): Promise<User> {
  return userRepository.save(user);
}

export async function authenticateUser(email: string, password: string): Promise<LoginResult> {
  const user = await findUserByEmailWithPassword(email);

  const isValidUser = user && (await bcrypt.compare(password, user.password));

  if (!isValidUser) {
    console.log(`Login attempt failed for email: ${email}`);
    return { success: false, message: 'Invalid credentials' };
  }

  console.log(`User ${user.email} logged in successfully`);
  const { password: _password, ...userWithoutPassword } = user;

  return {
    success: true,
    token: generateToken({ userId: user.id }),
    user: userWithoutPassword,
    message: 'Login successful',
  };
}

export async function createAdminUser(
  adminUserData: CreateAdminUserRequest,
): Promise<UserWithRole> {
  const { email, ...userData } = adminUserData;

  const existingUser = await userRepository.findOne({ where: { email } });

  if (existingUser) {
    console.log(`Updating existing user ${email} to admin role`);

    existingUser.role = UserRole.ADMIN;
    const updatedUser = await userRepository.save(existingUser);

    console.log(`User ${email} updated to admin successfully`);

    const { password: _password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as UserWithRole;
  }

  console.log(`Creating new admin user: ${email}`);

  const hashedPassword = await hashPassword(userData.password);

  const newAdminUser = userRepository.create({
    ...userData,
    email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  });

  const savedUser = await userRepository.save(newAdminUser);
  console.log(`Admin user ${email} created successfully`);

  const { password: _password, ...userWithoutPassword } = savedUser;
  return userWithoutPassword as UserWithRole;
}

export async function isUserAdmin(userId: number): Promise<boolean> {
  const user = await userRepository.findOne({
    where: { id: userId },
    select: ['role'],
  });

  return user?.role === UserRole.ADMIN;
}
