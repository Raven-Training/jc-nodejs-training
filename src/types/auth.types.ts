import { User } from '../entities/User';

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: Omit<User, 'password'>;
  message: string;
}

export interface ILoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    lastName: string;
    email: string;
    createdAt: Date;
  };
}
