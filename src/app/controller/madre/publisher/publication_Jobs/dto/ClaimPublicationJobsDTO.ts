import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class ClaimPublicationJobsDTO {
  @ApiProperty({
    example: 10,
    description: 'Cantidad máxima de jobs a reclamar'
  })
  @IsInt()
  limit: number;
}
