import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateOrdersBatchDTO } from 'src/app/controller/madre/orders/dto/CreateOrdersBatch.dto';
import { UpdateOrderStatusDTO } from 'src/app/controller/madre/orders/dto/UpdateOrderStatus.dto';
import { ISQLOrdersRepository } from 'src/core/adapters/repositories/madre/orders/ISQLOrdersRepository';

@Injectable()
export class OrdersService {
  private static readonly MAX_PENDING_LIMIT = 200;

  constructor(
    @Inject('ISQLOrdersRepository')
    private readonly repository: ISQLOrdersRepository
  ) {}

  async insertBatch(body: CreateOrdersBatchDTO) {
    if (!body.orders || !Array.isArray(body.orders)) {
      throw new InternalServerErrorException('orders must be an array');
    }

    if (body.orders.length === 0) {
      return { status: 'ok', total: 0, inserted: 0, skipped: 0 };
    }

    try {
      const result = await this.repository.insertBatch(body.orders);
      return { status: 'ok', ...result };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error inserting orders batch');
    }
  }

  async findByUniqueKey(uniqueKey: string) {
    const order = await this.repository.findByUniqueKey(uniqueKey);

    return {
      exists: order !== null,
      order
    };
  }

  async findPending(limit?: number) {
    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), OrdersService.MAX_PENDING_LIMIT);

    try {
      const items = await this.repository.findPending(safeLimit);
      return { limit: safeLimit, count: items.length, items };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Error retrieving pending orders');
    }
  }

  async updateStatus(id: number, data: UpdateOrderStatusDTO) {
    try {
      const updated = await this.repository.updateStatus(id, data);

      if (!updated) {
        throw new NotFoundException(`Order ${id} not found`);
      }

      return { status: 'ok' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException('Error updating order status');
    }
  }
}
