import { NormalizedOrderDTO } from 'src/app/controller/madre/orders/dto/CreateOrdersBatch.dto';
import { UpdateOrderStatusDTO } from 'src/app/controller/madre/orders/dto/UpdateOrderStatus.dto';
import { PaginatedResult } from 'src/core/entities/common/PaginatedResult';
import { PaginationParams } from 'src/core/entities/common/Pagination';

export interface InsertOrdersResult {
  total: number;
  inserted: number;
  skipped: number;
}

export interface ListOrdersFilters {
  marketplace?: string;
  persistence_status?: string;
  from?: string;
  to?: string;
  search?: string;
}

export interface FindPendingFilters {
  marketplace?: string;
  afterId?: number;
}

export interface ISQLOrdersRepository {
  insertBatch(orders: NormalizedOrderDTO[]): Promise<InsertOrdersResult>;
  findByUniqueKey(uniqueKey: string): Promise<any>;
  findPending(limit: number, filters?: FindPendingFilters): Promise<any[]>;
  list(filters: ListOrdersFilters, pagination: PaginationParams): Promise<PaginatedResult<any>>;
  updateStatus(id: number, data: UpdateOrderStatusDTO): Promise<boolean>;
}
