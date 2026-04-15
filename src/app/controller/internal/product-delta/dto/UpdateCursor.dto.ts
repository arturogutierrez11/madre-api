import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class UpdateCursorDto {
  @ApiProperty({
    example: 'products_api_delta',
    description: 'Identificador único del consumidor del cursor'
  })
  @IsString()
  @IsNotEmpty()
  sync_key: string;

  @ApiProperty({
    example: 123456,
    description: 'Último delta_id procesado por el consumidor'
  })
  @IsInt()
  @Min(0)
  last_delta_id: number;
}
