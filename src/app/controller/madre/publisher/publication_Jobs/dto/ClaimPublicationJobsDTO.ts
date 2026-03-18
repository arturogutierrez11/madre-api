import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ClaimPublicationJobsDTO {
  @ApiProperty({
    example: 10,
    description: 'Cantidad máxima de jobs a reclamar',
    minimum: 1,
    maximum: 50
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number;
}
