import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class SaveBrandMatchService {
  constructor(
    @Inject('BrandMatchRepository')
    private readonly repository
  ) {}

  async execute(data: { meliBrand: string; fravegaBrandId: string; fravegaBrandName: string; confidence: number }) {
    return this.repository.saveMatch(data);
  }
  async CheckIfBrandExist(fravegaBrandId: string) {
    const exists = await this.repository.existsByFravegaBrandId(fravegaBrandId);

    return {
      exists
    };
  }
}
