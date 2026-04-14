import { Body, Controller, NotFoundException, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { InternalApiKeyGuard } from 'src/app/guards/internal-api-key.guard';
import { TaxesCategoriesService } from 'src/app/services/taxes/TaxesCategoriesService';
import { GetTaxesCategoryByMlaDto } from './dto/GetTaxesCategoryByMla.dto';

@ApiTags('Taxes Categories - Internal')
@ApiSecurity('internal-api-key')
@Controller('internal/taxes/categories')
@UseGuards(InternalApiKeyGuard)
export class TaxesCategoriesController {
  constructor(private readonly taxesCategoriesService: TaxesCategoriesService) {}

  @Post('by-mla')
  @ApiOperation({
    summary: 'Busca una categoría arancelaria por MLA'
  })
  @ApiBody({ type: GetTaxesCategoryByMlaDto })
  @ApiResponse({
    status: 200,
    description: 'Fila encontrada en ml_categories'
  })
  async findByMla(@Body() body: GetTaxesCategoryByMlaDto) {
    const item = await this.taxesCategoriesService.findByMla(body.mla);

    if (!item) {
      throw new NotFoundException(`No taxes category found for MLA ${body.mla}`);
    }

    return item;
  }
}
