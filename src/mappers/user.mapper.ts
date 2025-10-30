import { User } from '../entities/User';
import { ILoginResponse } from '../types/auth.types';

type SafeUser = Omit<User, 'password'>;

export const mapLoginResponse = (
  token: string,
  user: SafeUser,
  message: string = 'Login successful',
): ILoginResponse => ({
  message,
  token,
  user: {
    id: user.id,
    name: user.name,
    lastName: user.lastName,
    email: user.email,
    createdAt: user.createdAt,
  },
});
