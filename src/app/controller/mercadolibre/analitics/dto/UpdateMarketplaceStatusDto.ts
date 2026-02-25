import { IsEnum } from 'class-validator';

export class UpdateMarketplaceStatusDto {
  @IsEnum(['active', 'closed'])
  status: 'active' | 'closed';
}
