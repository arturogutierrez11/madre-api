import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class BulkProductSnapshotDto {
  @ApiProperty({
    example: ['B0953HLGJ3', 'B09GK544PP'],
    type: [String],
    description: 'Lista de SKUs a consultar'
  })
  @IsArray()
  @IsString({ each: true })
  skus!: string[];
}
