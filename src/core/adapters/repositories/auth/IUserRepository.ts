import { User } from 'src/core/entities/auth/User';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updateLastLoginAt(id: string, lastLoginAt: Date): Promise<boolean>;
  existsById(id: string): Promise<boolean>;
}
