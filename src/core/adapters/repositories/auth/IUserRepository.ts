import { User } from 'src/core/entities/auth/User';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  isActive: boolean;
}

export interface IUserRepository {
  create(data: CreateUserData): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updateLastLoginAt(id: string, lastLoginAt: Date): Promise<boolean>;
  existsById(id: string): Promise<boolean>;
}
