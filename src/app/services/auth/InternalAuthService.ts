import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRefreshTokenData, IRefreshTokenRepository } from 'src/core/adapters/repositories/auth/IRefreshTokenRepository';
import { CreateUserData, IUserRepository } from 'src/core/adapters/repositories/auth/IUserRepository';
import { RefreshToken } from 'src/core/entities/auth/RefreshToken';
import { User } from 'src/core/entities/auth/User';

@Injectable()
export class InternalAuthService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository
  ) {}

  async createUser(data: CreateUserData): Promise<User> {
    const email = data.email.trim().toLowerCase();
    const passwordHash = data.passwordHash.trim();
    const name = data.name.trim();
    const role = data.role.trim();

    if (!email) {
      throw new BadRequestException('email is required');
    }

    if (!passwordHash) {
      throw new BadRequestException('passwordHash is required');
    }

    if (!name) {
      throw new BadRequestException('name is required');
    }

    if (!role) {
      throw new BadRequestException('role is required');
    }

    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    return this.userRepository.create({
      email,
      passwordHash,
      name,
      role,
      isActive: data.isActive
    });
  }

  async findUserByEmail(email: string): Promise<User> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      throw new BadRequestException('email is required');
    }

    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async createRefreshToken(data: CreateRefreshTokenData): Promise<RefreshToken> {
    if (!(await this.userRepository.existsById(data.userId))) {
      throw new NotFoundException('User not found');
    }

    return this.refreshTokenRepository.create(data);
  }

  async findValidRefreshToken(tokenHash: string): Promise<RefreshToken> {
    const normalizedTokenHash = tokenHash.trim();

    if (!normalizedTokenHash) {
      throw new BadRequestException('tokenHash is required');
    }

    const token = await this.refreshTokenRepository.findValidByTokenHash(normalizedTokenHash);

    if (!token) {
      throw new NotFoundException('Valid refresh token not found');
    }

    return token;
  }

  async revokeRefreshToken(tokenHash: string): Promise<void> {
    const normalizedTokenHash = tokenHash.trim();

    if (!normalizedTokenHash) {
      throw new BadRequestException('tokenHash is required');
    }

    const revoked = await this.refreshTokenRepository.revokeByTokenHash(normalizedTokenHash, new Date());

    if (!revoked) {
      throw new NotFoundException('Refresh token not found');
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    const updated = await this.userRepository.updateLastLoginAt(id, new Date());

    if (!updated) {
      throw new NotFoundException('User not found');
    }
  }
}
