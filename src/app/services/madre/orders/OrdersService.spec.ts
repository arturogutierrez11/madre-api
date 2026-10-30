import { ISQLOrdersRepository } from 'src/core/adapters/repositories/madre/orders/ISQLOrdersRepository';
import { OrdersService } from './OrdersService';

describe('OrdersService.findPending', () => {
  let findPending: jest.Mock<Promise<any[]>, Parameters<ISQLOrdersRepository['findPending']>>;
  let service: OrdersService;

  beforeEach(() => {
    findPending = jest.fn<Promise<any[]>, Parameters<ISQLOrdersRepository['findPending']>>();
    const repository: ISQLOrdersRepository = {
      insertBatch: jest.fn(),
      findByUniqueKey: jest.fn(),
      findPending,
      updateStatus: jest.fn()
    };
    service = new OrdersService(repository);
  });

  it('limita a 200 y devuelve nextAfterId cuando la pagina viene llena', async () => {
    const items = Array.from({ length: 200 }, (_, i) => ({ id: i + 1 }));
    findPending.mockResolvedValueOnce(items);

    const result = await service.findPending(1000, { marketplace: 'fravega' });

    expect(findPending).toHaveBeenCalledWith(200, { marketplace: 'fravega' });
    expect(result).toMatchObject({ limit: 200, count: 200, nextAfterId: 200 });
  });

  it('nextAfterId null cuando no hay mas', async () => {
    findPending.mockResolvedValueOnce([{ id: 5 }]);

    const result = await service.findPending(50);

    expect(findPending).toHaveBeenCalledWith(50, {});
    expect(result).toMatchObject({ limit: 50, count: 1, nextAfterId: null });
  });
});
