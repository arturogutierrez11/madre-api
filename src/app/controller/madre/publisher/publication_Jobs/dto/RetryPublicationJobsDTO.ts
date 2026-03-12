import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class RetryPublicationJobsDTO {
  @ApiProperty({
    example: 25,
    description: 'ID del publication run'
  })
  @IsInt()
  run_id: number;
}
