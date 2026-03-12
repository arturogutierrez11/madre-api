import { ApiProperty } from '@nestjs/swagger';

export class CreatePublicationRunResponseDto {
  @ApiProperty({
    example: 25,
    description: 'ID del proceso de publicación'
  })
  run_id: number;

  @ApiProperty({
    example: 'created',
    description: 'Estado inicial del run'
  })
  status: string;
}
