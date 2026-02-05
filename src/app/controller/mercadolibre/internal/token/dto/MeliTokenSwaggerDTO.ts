import { ApiProperty } from '@nestjs/swagger';

export class MeliTokenSwaggerDTO {
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

  @ApiProperty({
    description: 'Fecha exacta de expiración del token (ISO 8601)',
    example: '2026-02-05T15:30:00.000Z'
  })
  expires_at: string;
}
