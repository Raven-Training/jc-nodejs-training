import { User } from '../entities/User';

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: Omit<User, 'password'>;
  message: string;
}