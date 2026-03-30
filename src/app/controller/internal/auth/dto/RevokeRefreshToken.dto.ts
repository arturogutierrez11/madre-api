import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RevokeRefreshTokenDto {
  @ApiProperty({
    example: 'hashed-token',
    description: 'Hash del refresh token a revocar'
  })
  @IsString()
  tokenHash: string;
}
