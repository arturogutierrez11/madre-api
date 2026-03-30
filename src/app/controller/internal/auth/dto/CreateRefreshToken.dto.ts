import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRefreshTokenDto {
  @ApiProperty({
    example: '2f94563d-9f75-4ccf-97c8-99ef59c4db82',
    description: 'ID del usuario dueño del refresh token'
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: 'hashed-token',
    description: 'Hash persistido del refresh token'
  })
  @IsString()
  tokenHash: string;

  @ApiProperty({
    example: '2026-04-10T10:00:00.000Z',
    description: 'Fecha de expiración en formato ISO'
  })
  @IsDateString()
  expiresAt: string;

  @ApiPropertyOptional({
    example: 'Mozilla/5.0',
    description: 'User agent de la sesión'
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({
    example: '127.0.0.1',
    description: 'IP de origen de la sesión'
  })
  @IsOptional()
  @IsString()
  ip?: string;
}
