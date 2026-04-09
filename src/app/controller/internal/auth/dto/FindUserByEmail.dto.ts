import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class FindUserByEmailDto {
  @ApiProperty({
    example: 'admin@empresa.com',
    description: 'Email del usuario a buscar'
  })
  @IsEmail()
  email: string;
}
