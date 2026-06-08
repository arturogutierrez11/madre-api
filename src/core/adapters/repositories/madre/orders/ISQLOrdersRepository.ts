import { NormalizedOrderDTO } from 'src/app/controller/madre/orders/dto/CreateOrdersBatch.dto';
import { UpdateOrderStatusDTO } from 'src/app/controller/madre/orders/dto/UpdateOrderStatus.dto';

export interface InsertOrdersResult {
  total: number;
  inserted: number;
  skipped: number;
}

export interface ISQLOrdersRepository {
  insertBatch(orders: NormalizedOrderDTO[]): Promise<InsertOrdersResult>;
  findByUniqueKey(uniqueKey: string): Promise<any>;
  findPending(limit: number): Promise<any[]>;
  updateStatus(id: number, data: UpdateOrderStatusDTO): Promise<boolean>;
}
