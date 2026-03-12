import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdatePublicationJobDTO {
  @ApiProperty({
    example: 'success',
    description: 'Nuevo estado del job',
    enum: ['processing', 'success', 'retry', 'failed']
  })
  @IsString()
  status: string;

  @ApiProperty({
    example: { publicationId: 12345 },
    description: 'Resultado devuelto por el marketplace',
    required: false
  })
  @IsOptional()
  result?: any;

  @ApiProperty({
    example: 'Error de conexión con el marketplace',
    description: 'Mensaje de error en caso de fallo',
    required: false
  })
  @IsOptional()
  error_message?: string;

  @ApiProperty({
    example: { title: 'Nike Air Max', price: 200 },
    description: 'Payload enviado al marketplace',
    required: false
  })
  @IsOptional()
  request_payload?: any;

  @ApiProperty({
    example: { id: 'MLA12345678', status: 'active' },
    description: 'Respuesta completa del marketplace',
    required: false
  })
  @IsOptional()
  response_payload?: any;

  @ApiProperty({
    example: 'MLA12345678',
    description: 'ID de la publicación en el marketplace',
    required: false
  })
  @IsOptional()
  marketplace_item_id?: string;
}
