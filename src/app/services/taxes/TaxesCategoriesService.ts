import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ISQLTaxesCategoriesRepository } from 'src/core/adapters/repositories/taxes/ISQLTaxesCategoriesRepository';

@Injectable()
export class TaxesCategoriesService {
  constructor(
    @Inject('ISQLTaxesCategoriesRepository')
    private readonly repository: ISQLTaxesCategoriesRepository
  ) {}

  async findByMla(mla: string) {
    const normalizedMla = String(mla ?? '').trim().toUpperCase();

    if (!normalizedMla) {
      throw new BadRequestException('mla is required');
    }

    return this.repository.findByMla(normalizedMla);
  }
}
