import { User } from '../../src/entities/User';
import { generateUser } from './factories';

export const generateTestUser = (hashedPassword: string, overrides: Partial<User> = {}) => {
  return generateUser({
    id: 1,
    name: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    password: hashedPassword,
    ...overrides,
  });
};

export const generateExpectedUserResponse = (overrides = {}) => ({
  id: 1,
  name: 'John',
  lastName: 'Doe',
  email: 'john@test.com',
  createdAt: expect.any(Date),
  ...overrides,
});

export const generateSuccessfulLoginResponse = (
  token = 'jwt-token-here',
  user = {
    id: 1,
    name: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    createdAt: new Date(),
  },
  message = 'Login successful',
) => ({
  success: true,
  token,
  user,
  message,
});

export const generateFailedLoginResponse = (message = 'Invalid credentials') => ({
  success: false,
  message,
});

export const generateInvalidLoginCredentials = (type: 'email' | 'password' | 'both' = 'both') => {
  const base = { email: 'john@example.com', password: 'password123' };

  switch (type) {
    case 'email':
      return { ...base, email: 'invalid-email' };
    case 'password':
      return { email: base.email };
    case 'both':
    default:
      return { password: 'password123' };
  }
};

export const generatePaginationParams = (page = 1, limit = 10) => ({
  page,
  limit,
  offset: (page - 1) * limit,
});

export const generatePaginationMetadata = (page = 1, limit = 10, total = 25, overrides = {}) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    ...overrides,
  };
};

export const generatePaginatedResponse = <T>(
  data: T[],
  paginationMeta = generatePaginationMetadata(),
) => ({
  data,
  pagination: paginationMeta,
});

export const generateDatabaseError = (message = 'Database connection failed') => {
  const error = new Error(message);
  error.name = 'DatabaseError';
  return error;
};

export const generateBcryptError = (message = 'bcrypt comparison failed') => {
  const error = new Error(message);
  error.name = 'BcryptError';
  return error;
};
