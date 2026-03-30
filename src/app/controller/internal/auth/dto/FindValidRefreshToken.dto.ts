import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FindValidRefreshTokenDto {
  @ApiProperty({
    example: 'hashed-token',
    description: 'Hash del refresh token a validar'
  })
  @IsString()
  tokenHash: string;
}
