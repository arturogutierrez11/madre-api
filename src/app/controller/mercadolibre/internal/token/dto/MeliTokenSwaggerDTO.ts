import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MeliTokenSwaggerDTO {
  @ApiPropertyOptional({
    description: 'Identificador lógico de la app de Mercado Libre',
    example: 'default'
  })
  app_key?: string;

  @ApiPropertyOptional({
    description: 'Client ID real de la app de Mercado Libre. Si no se envía, se usa app_key.',
    example: '382706031020831'
  })
  client_id?: string;

  @ApiProperty({
    description: 'Access token devuelto por MercadoLibre',
    example: 'APP_USR-1234567890abcdef'
  })
  access_token: string;

  @ApiProperty({
    description: 'Refresh token devuelto por MercadoLibre',
    example: 'TG-abcdef1234567890'
  })
  refresh_token: string;

  @ApiProperty({
    description: 'Tiempo de expiración en segundos',
    example: 21600
  })
  expires_in: number;

  @ApiPropertyOptional({
    description: 'Fecha exacta de expiración del token (calculada por el backend)',
    example: '2026-02-05T15:30:00.000Z',
    readOnly: true
  })
  expires_at?: string;
}
