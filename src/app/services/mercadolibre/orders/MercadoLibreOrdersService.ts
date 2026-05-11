import { Inject, Injectable } from '@nestjs/common';
import { ISQLMercadoLibreOrdersRepository } from 'src/core/adapters/repositories/mercadolibre/orders/ISQLMercadoLibreOrdersRepository';

const DEFAULT_FROM_DATE = '2026-05-01 00:00:00';

@Injectable()
export class MercadoLibreOrdersService {
  constructor(
    @Inject('ISQLMercadoLibreOrdersRepository')
    private readonly ordersRepository: ISQLMercadoLibreOrdersRepository
  ) {}

  async getOrdersWithAporteMl(params: { limit?: number; offset?: number; status?: string }) {
    return this.ordersRepository.findOrdersWithAporteMl({
      limit: this.toSafeLimit(params.limit),
      offset: this.toSafeOffset(params.offset),
      fromDate: DEFAULT_FROM_DATE,
      status: this.toSafeStatus(params.status)
    });
  }

  async getOrderAporteMlSummaries(params: { limit?: number; offset?: number; status?: string }) {
    return this.ordersRepository.findOrderAporteMlSummaries({
      limit: this.toSafeLimit(params.limit),
      offset: this.toSafeOffset(params.offset),
      fromDate: DEFAULT_FROM_DATE,
      status: this.toSafeStatus(params.status)
    });
  }

  async getOrderAporteMlSummariesByDateRange(params: {
    limit?: number;
    offset?: number;
    fromDate?: string;
    toDate?: string;
    status?: string;
  }) {
    return this.ordersRepository.findOrderAporteMlSummaries({
      limit: this.toSafeLimit(params.limit),
      offset: this.toSafeOffset(params.offset),
      fromDate: params.fromDate?.trim() || DEFAULT_FROM_DATE,
      toDate: params.toDate?.trim() || undefined,
      status: this.toSafeStatus(params.status)
    });
  }

  async getAporteMlOverview(params: {
    fromDate?: string;
    toDate?: string;
    status?: string;
  }) {
    return this.ordersRepository.getAporteMlOverview({
      fromDate: params.fromDate?.trim() || DEFAULT_FROM_DATE,
      toDate: params.toDate?.trim() || undefined,
      status: this.toSafeStatus(params.status)
    });
  }

  async getAporteMlTimeSeries(params: {
    fromDate?: string;
    toDate?: string;
    status?: string;
    groupBy?: string;
  }) {
    const normalizedGroupBy = String(params.groupBy ?? 'day').trim().toLowerCase();

    return this.ordersRepository.getAporteMlTimeSeries({
      fromDate: params.fromDate?.trim() || DEFAULT_FROM_DATE,
      toDate: params.toDate?.trim() || undefined,
      status: this.toSafeStatus(params.status),
      groupBy: normalizedGroupBy === 'month' ? 'month' : 'day'
    });
  }

  async getOrdersByStatus(params: {
    fromDate?: string;
    toDate?: string;
  }) {
    return this.ordersRepository.getOrdersByStatus({
      fromDate: params.fromDate?.trim() || DEFAULT_FROM_DATE,
      toDate: params.toDate?.trim() || undefined
    });
  }

  private toSafeLimit(value?: number) {
    return Math.min(Math.max(Number(value) || 50, 1), 500);
  }

  private toSafeOffset(value?: number) {
    return Math.max(Number(value) || 0, 0);
  }

  private toSafeStatus(value?: string) {
    const normalized = String(value ?? '').trim().toLowerCase();
    return normalized || undefined;
  }
}
