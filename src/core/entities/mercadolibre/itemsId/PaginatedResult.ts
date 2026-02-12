export type PaginatedResult<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  count: number;
  hasNext: boolean;
  nextOffset: number | null;
};
export interface CursorPaginatedResult<T> {
  items: T[];
  limit: number;
  count: number;
  lastId: number | null;
  hasNext: boolean;
}
