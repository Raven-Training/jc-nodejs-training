import { User } from '../entities/User';
import { UserRole } from './user.types';

export interface JwtPayload {
  userId: number;
}

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: Omit<User, 'password'>;
  message: string;
  role: UserRole;
}

export interface ILoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    lastName: string;
    email: string;
    role: UserRole;
    createdAt: Date;
  };
}
