import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ISQLMegatoneBrandMatchRepository } from 'src/core/adapters/repositories/madre/brands/match/megatoneBrandsMatch/ISQLMegatoneBrandMatchRepository';

@Injectable()
export class SaveMegatoneBrandMatchService {
  constructor(
    @Inject('ISQLMegatoneBrandMatchRepository')
    private readonly repository: ISQLMegatoneBrandMatchRepository
  ) {}

  async execute(data: { meliBrand: string; megatoneBrandId: string; megatoneBrandName: string; confidence: number }) {
    return this.repository.saveMatch(data);
  }

  async checkIfBrandExist(megatoneBrandId: string) {
    const exists = await this.repository.existsByMegatoneBrandId(megatoneBrandId);
    return { exists };
  }

  async findByMeliBrand(meliBrand: string) {
    const brand = await this.repository.findByMeliBrand(meliBrand);

    if (!brand) {
      throw new NotFoundException(`No match found for meliBrand: ${meliBrand}`);
    }

    return brand;
  }
}
