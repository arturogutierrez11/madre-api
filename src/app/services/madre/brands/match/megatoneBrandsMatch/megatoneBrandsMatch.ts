import { Injectable, Inject } from '@nestjs/common';
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
}
