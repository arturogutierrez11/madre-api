import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'admin@empresa.com',
    description: 'Email del usuario'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '$2b$10$...',
    description: 'Hash de password ya calculado por auth-api'
  })
  @IsString()
  passwordHash: string;

  @ApiProperty({
    example: 'Admin',
    description: 'Nombre del usuario'
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'admin',
    description: 'Rol del usuario'
  })
  @IsString()
  role: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Estado activo del usuario. Default true'
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
