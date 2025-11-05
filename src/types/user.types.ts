export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface CreateAdminUserRequest {
  name: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserWithRole {
  id: number;
  name: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}
