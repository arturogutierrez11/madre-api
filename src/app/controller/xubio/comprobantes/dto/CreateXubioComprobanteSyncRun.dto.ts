import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateXubioComprobanteSyncRunDto {
  @ApiProperty({ example: 'historical_backfill' })
  @IsIn(['historical_backfill', 'daily_update', 'manual_retry'])
  syncType!: 'historical_backfill' | 'daily_update' | 'manual_retry';

  @ApiProperty({ example: 'running' })
  @IsIn(['running', 'completed', 'failed', 'partial'])
  status!: 'running' | 'completed' | 'failed' | 'partial';

  @ApiProperty({ example: '2026-07-01' })
  @IsString()
  fechaDesde!: string;

  @ApiProperty({ example: '2026-07-31' })
  @IsString()
  fechaHasta!: string;

  @ApiProperty({ example: 'month' })
  @IsIn(['month', 'day', 'custom'])
  windowType!: 'month' | 'day' | 'custom';

  @ApiPropertyOptional() @IsOptional() @IsInt() totalListed?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() totalDetailRequests?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() totalInserted?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() totalUpdated?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() totalFailed?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasSaturatedWindows?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() errorMessage?: string;
  @ApiPropertyOptional({ example: {} }) @IsOptional() @IsObject() metadata?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @IsString() finishedAt?: string;
}
