export interface ISQLMercadoLibreItemsRepository {
  insertBulkItems(params: { sellerId: string; items: string[]; status: string }): Promise<number>;

  findAll(
    pagination: {
      limit: number;
      lastId?: number;
    },
    filters?: {
      sellerId?: string;
      status?: string;
    }
  ): Promise<{
    items: string[];
    limit: number;
    lastId: number | null;
    count: number;
    hasNext: boolean;
  }>;
}
