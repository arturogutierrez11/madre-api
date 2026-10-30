import { EntityManager } from 'typeorm';
import { NormalizedOrderDTO } from 'src/app/controller/madre/orders/dto/CreateOrdersBatch.dto';
import { SQLOrdersRepository } from './SQLOrdersRepository';

describe('SQLOrdersRepository', () => {
  let query: jest.Mock<Promise<unknown>, [string, unknown[]]>;
  let repository: SQLOrdersRepository;

  const baseOrder: NormalizedOrderDTO = {
    marketplace: 'fravega',
    external_order_id: '19836023',
    external_suborder_id: 'v93713051frvg-01',
    unique_key: 'fravega:v93713051frvg-01',
    purchase_date: '2026-10-30T12:00:00Z',
    source_payload: { id: 1 }
  };

  beforeEach(() => {
    query = jest.fn<Promise<unknown>, [string, unknown[]]>();
    repository = new SQLOrdersRepository({ query } as unknown as EntityManager);
  });

  describe('insertBatch', () => {
    it('inserta con PENDING y nulls cuando no vienen los campos de procesamiento', async () => {
      query.mockResolvedValueOnce([]).mockResolvedValueOnce({ affectedRows: 1 });

      const result = await repository.insertBatch([baseOrder]);

      expect(result).toEqual({ total: 1, inserted: 1, skipped: 0 });
      const [sql, params] = query.mock.calls[1];
      expect(sql).toContain('ON DUPLICATE KEY UPDATE unique_key = unique_key');
      expect(params.slice(-7)).toEqual([null, 'PENDING', null, null, null, null, null]);
    });

    it('inserta la orden ya procesada con el resultado de VBI', async () => {
      query.mockResolvedValueOnce([]).mockResolvedValueOnce({ affectedRows: 1 });

      await repository.insertBatch([
        {
          ...baseOrder,
          estimated_delivery_date: '2026-11-05T03:00:00Z',
          persistence_status: 'CANCELLED',
          notification_system_b_status: 'success',
          floxu_code: 'TLQV-22733',
          vbi_sale_id: 'sale-1',
          vbi_nro_venta: '19836023',
          last_error: '[CANCELLED] Seller Central: Canceled'
        }
      ]);

      const [sql, params] = query.mock.calls[1];
      expect(sql).toContain(
        'estimated_delivery_date, persistence_status, notification_system_b_status, floxu_code, vbi_sale_id, vbi_nro_venta, last_error'
      );
      expect(params.slice(-7)).toEqual([
        '2026-11-05 03:00:00',
        'CANCELLED',
        'success',
        'TLQV-22733',
        'sale-1',
        '19836023',
        '[CANCELLED] Seller Central: Canceled'
      ]);
    });

    it('cuenta como salteadas las que ya existen', async () => {
      query.mockResolvedValueOnce([{ unique_key: baseOrder.unique_key }]).mockResolvedValueOnce({ affectedRows: 0 });

      const result = await repository.insertBatch([baseOrder, { ...baseOrder, unique_key: 'fravega:otra' }]);

      expect(result).toEqual({ total: 2, inserted: 1, skipped: 1 });
    });
  });

  describe('findPending', () => {
    it('sin filtros pide solo las PENDING ordenadas por id', async () => {
      query.mockResolvedValueOnce([]);

      await repository.findPending(50);

      const [sql, params] = query.mock.calls[0];
      expect(sql).toContain(`WHERE persistence_status = 'PENDING'\n`);
      expect(sql).toContain('ORDER BY id ASC');
      expect(params).toEqual([50]);
    });

    it('filtra por marketplace y pagina desde afterId', async () => {
      query.mockResolvedValueOnce([{ id: '121', amount_total: '10.50', items_quantity: 1, source_payload: '{"a":1}' }]);

      const items = await repository.findPending(200, { marketplace: 'fravega', afterId: 120 });

      const [sql, params] = query.mock.calls[0];
      expect(sql).toContain(`WHERE persistence_status = 'PENDING' AND marketplace = ? AND id > ?`);
      expect(params).toEqual(['fravega', 120, 200]);
      expect(items[0]).toMatchObject({ id: 121, amount_total: 10.5, source_payload: { a: 1 } });
    });

    it('acepta afterId 0', async () => {
      query.mockResolvedValueOnce([]);

      await repository.findPending(10, { afterId: 0 });

      expect(query.mock.calls[0][1]).toEqual([0, 10]);
    });
  });

  describe('list', () => {
    it('sin filtros pagina por fecha de compra y no trae los payloads', async () => {
      query
        .mockResolvedValueOnce([{ total: '3' }])
        .mockResolvedValueOnce([{ id: '9', amount_total: null, items_quantity: null }]);

      const result = await repository.list({}, { limit: 1, offset: 1 });

      const [countSql, countParams] = query.mock.calls[0];
      const [sql, params] = query.mock.calls[1];
      expect(countSql).toContain('SELECT COUNT(*) AS total FROM development_orders ');
      expect(countParams).toEqual([]);
      expect(sql).toContain('ORDER BY purchase_date DESC, id DESC');
      expect(sql).not.toContain('source_payload');
      expect(params).toEqual([1, 1]);
      expect(result).toEqual({
        items: [{ id: 9, amount_total: null, items_quantity: null }],
        total: 3,
        limit: 1,
        offset: 1,
        count: 1,
        hasNext: true,
        nextOffset: 2
      });
    });

    it('combina los filtros y escapa los comodines de la busqueda', async () => {
      query.mockResolvedValueOnce([{ total: 0 }]).mockResolvedValueOnce([]);

      const result = await repository.list(
        {
          marketplace: 'fravega',
          persistence_status: 'FAILED',
          from: '2026-10-01T00:00:00Z',
          to: '2026-10-31T23:59:59Z',
          search: '50%_off'
        },
        { limit: 50, offset: 0 }
      );

      const [sql, params] = query.mock.calls[1];
      expect(sql).toContain(
        'WHERE marketplace = ? AND persistence_status = ? AND purchase_date >= ? AND purchase_date <= ? AND (unique_key LIKE ?'
      );
      expect(params.slice(0, 5)).toEqual([
        'fravega',
        'FAILED',
        '2026-10-01 00:00:00',
        '2026-10-31 23:59:59',
        '%50\\%\\_off%'
      ]);
      expect(params).toHaveLength(4 + 7 + 2);
      expect(result).toMatchObject({ total: 0, count: 0, hasNext: false, nextOffset: null });
    });
  });

  describe('updateStatus', () => {
    it('actualiza solo los campos enviados, incluidos los nuevos', async () => {
      query.mockResolvedValueOnce({ affectedRows: 1 });

      const updated = await repository.updateStatus(7, {
        persistence_status: 'CANCELLED',
        status: 'Canceled',
        delivery_status: 'Canceled',
        estimated_delivery_date: '2026-11-05T03:00:00Z',
        vbi_sale_id: 'sale-1',
        vbi_nro_venta: null
      });

      expect(updated).toBe(true);
      const [sql, params] = query.mock.calls[0];
      expect(sql).toContain(
        'SET persistence_status = ?, status = ?, delivery_status = ?, estimated_delivery_date = ?, vbi_sale_id = ?, vbi_nro_venta = ?, last_processed_at = NOW()'
      );
      expect(params).toEqual(['CANCELLED', 'Canceled', 'Canceled', '2026-11-05 03:00:00', 'sale-1', null, 7]);
    });

    it('devuelve false si no existe la orden', async () => {
      query.mockResolvedValueOnce({ affectedRows: 0 });

      await expect(repository.updateStatus(99, { floxu_code: 'TLQV-1' })).resolves.toBe(false);
    });
  });
});
