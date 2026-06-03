import { PlanillaControlPayload } from 'src/core/entities/planilladecontrol/PlanillaControl';

export interface PlanillaControlListParams {
  limit: number;
  offset: number;
  identificador?: string;
  sku?: string;
}

export interface IPlanillaControlRepository {
  create(id: string, payload: PlanillaControlPayload): Promise<any>;
  findAll(params: PlanillaControlListParams): Promise<{
    items: any[];
    total: number;
    limit: number;
    offset: number;
    count: number;
    hasNext: boolean;
    nextOffset: number | null;
  }>;
  findById(id: string): Promise<any | null>;
  update(id: string, payload: PlanillaControlPayload): Promise<any | null>;
  delete(id: string): Promise<boolean>;
}
