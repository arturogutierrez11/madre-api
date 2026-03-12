import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested, IsString, IsInt } from 'class-validator';

class JobDTO {
  @ApiProperty({
    example: 'SKU123',
    description: 'SKU interno del producto'
  })
  @IsString()
  sku: string;

  @ApiProperty({
    example: 'meli',
    description: 'Marketplace destino'
  })
  @IsString()
  marketplace: string;
}

export class CreatePublicationJobsDTO {
  @ApiProperty({
    example: 1,
    description: 'ID del publication run'
  })
  @IsInt()
  run_id: number;

  @ApiProperty({
    type: [JobDTO],
    description: 'Lista de jobs a crear'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobDTO)
  jobs: JobDTO[];
}
