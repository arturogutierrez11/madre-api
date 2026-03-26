import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ClaimPublicationJobsDTO {
  @ApiProperty({
    example: 50,
    description: 'Cantidad solicitada de jobs a reclamar. Si supera 50, el backend devuelve 50.',
    minimum: 1,
    default: 50
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
