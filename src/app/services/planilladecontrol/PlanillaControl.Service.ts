import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IPlanillaControlRepository } from 'src/core/adapters/repositories/planilladecontrol/IPlanillaControlRepository';
import {
  derivePlanillaControlId,
  normalizePlanillaControlKey,
  PlanillaControlPayload
} from 'src/core/entities/planilladecontrol/PlanillaControl';

@Injectable()
export class PlanillaControlService {
  constructor(
    @Inject('IPlanillaControlRepository')
    private readonly repository: IPlanillaControlRepository
  ) {}

  async create(body: Record<string, unknown>) {
    const id = derivePlanillaControlId(body);
    if (!id) {
      throw new BadRequestException('El body debe incluir id o Identificador.');
    }

    const payload = this.sanitizePayload(body);
    return this.repository.create(id, payload);
  }

  async findAll(params: { limit?: number; offset?: number; identificador?: string; sku?: string }) {
    return this.repository.findAll({
      limit: Math.min(Math.max(Number(params.limit) || 50, 1), 500),
      offset: Math.max(Number(params.offset) || 0, 0),
      identificador: params.identificador,
      sku: params.sku
    });
  }

  async findById(id: string) {
    const item = await this.repository.findById(id);

    if (!item) {
      throw new NotFoundException(`No se encontró registro de planilla_control con id ${id}`);
    }

    return item;
  }

  async update(id: string, body: Record<string, unknown>) {
    await this.findById(id);
    const payload = this.sanitizePayload(body);
    const updated = await this.repository.update(id, payload);

    if (!updated) {
      throw new NotFoundException(`No se encontró registro de planilla_control con id ${id}`);
    }

    return updated;
  }

  async delete(id: string) {
    await this.findById(id);
    const deleted = await this.repository.delete(id);

    return {
      success: deleted,
      id
    };
  }

  private sanitizePayload(body: Record<string, unknown>): PlanillaControlPayload {
    const payload: PlanillaControlPayload = {};

    for (const [key, value] of Object.entries(body ?? {})) {
      const normalizedKey = normalizePlanillaControlKey(key);

      if (!normalizedKey) {
        continue;
      }

      payload[normalizedKey] = value;
    }

    if (Object.keys(payload).length === 0) {
      throw new BadRequestException(
        'El body no contiene columnas válidas. Usá claves snake_case normalizadas o nombres originales de la planilla.'
      );
    }

    return payload;
  }
}
