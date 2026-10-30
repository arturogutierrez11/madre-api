import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateOrdersBatchDTO } from './CreateOrdersBatch.dto';
import { ListOrdersDTO } from './ListOrders.dto';
import { UpdateOrderStatusDTO } from './UpdateOrderStatus.dto';

const validationErrors = async (cls: new () => object, plain: object) => {
  const errors = await validate(plainToInstance(cls, plain), { whitelist: true });
  return errors;
};

describe('Orders DTOs', () => {
  const order = {
    marketplace: 'fravega',
    external_order_id: '19836023',
    unique_key: 'fravega:v93713051frvg-01',
    source_payload: {}
  };

  it('batch acepta los campos del resultado de VBI y CANCELLED', async () => {
    const errors = await validationErrors(CreateOrdersBatchDTO, {
      orders: [
        {
          ...order,
          estimated_delivery_date: '2026-11-05T03:00:00Z',
          persistence_status: 'CANCELLED',
          notification_system_b_status: 'success',
          floxu_code: 'TLQV-22733',
          vbi_sale_id: 'sale-1',
          vbi_nro_venta: '19836023',
          last_error: null
        }
      ]
    });

    expect(errors).toHaveLength(0);
  });

  it('batch rechaza un persistence_status desconocido', async () => {
    const errors = await validationErrors(CreateOrdersBatchDTO, {
      orders: [{ ...order, persistence_status: 'DONE' }]
    });

    expect(errors).toHaveLength(1);
  });

  it('PATCH acepta status, delivery_status, vbi_* y CANCELLED', async () => {
    const errors = await validationErrors(UpdateOrderStatusDTO, {
      persistence_status: 'CANCELLED',
      status: 'Canceled',
      delivery_status: null,
      estimated_delivery_date: '2026-11-05T03:00:00Z',
      vbi_sale_id: 'sale-1',
      vbi_nro_venta: '19836023'
    });

    expect(errors).toHaveLength(0);
  });

  it('PATCH rechaza una fecha estimada invalida', async () => {
    const errors = await validationErrors(UpdateOrderStatusDTO, { estimated_delivery_date: 'manana' });

    expect(errors.map(error => error.property)).toEqual(['estimated_delivery_date']);
  });

  it('listado convierte limit/offset de la query y acepta los filtros', async () => {
    const query = plainToInstance(ListOrdersDTO, {
      marketplace: 'fravega',
      persistence_status: 'CANCELLED',
      from: '2026-10-01T00:00:00Z',
      limit: '20',
      offset: '40'
    });

    expect(await validate(query)).toHaveLength(0);
    expect(query).toMatchObject({ limit: 20, offset: 40 });
  });

  it('listado rechaza limit mayor a 200 y fechas invalidas', async () => {
    const errors = await validationErrors(ListOrdersDTO, { limit: '500', to: 'ayer' });

    expect(errors.map(error => error.property).sort()).toEqual(['limit', 'to']);
  });
});
