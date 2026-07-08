import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateInvoiceClientIssueDto {
  @ApiPropertyOptional({ enum: ['open', 'resolved', 'ignored'], example: 'resolved' })
  @IsOptional()
  @IsIn(['open', 'resolved', 'ignored'])
  status?: 'open' | 'resolved' | 'ignored';

  @ApiPropertyOptional({ example: 'medium' })
  @IsOptional()
  @IsString()
  severity?: string;

  @ApiPropertyOptional({ example: 'arturo' })
  @IsOptional()
  @IsString()
  resolvedBy?: string;

  @ApiPropertyOptional({ example: 'Se corrigió el CUIT en Flokzu.' })
  @IsOptional()
  @IsString()
  resolutionNotes?: string;
}
