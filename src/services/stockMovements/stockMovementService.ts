import type { AxiosInstance } from 'axios';
import type { StockMovement, StockMovementType } from '@/types/inventory';

export interface StockMovementParams {
  product_id: string;
  warehouse_id: string;
  type: StockMovementType;
  quantity: number;
  date: string;
  note: string;
}

export interface StockMovementListFilter {
  product_id?: string | undefined;
  category_id?: string | undefined;
  warehouse_id?: string | undefined;
  type?: StockMovementType | undefined;
  search?: string | undefined;
  date_from?: string | undefined;
  date_to?: string | undefined;
}

// Append-only ledger: intentionally no update or delete method here.
export interface IStockMovementService {
  list(filter?: StockMovementListFilter): Promise<{ data: StockMovement[] }>;
  create(params: StockMovementParams): Promise<{ data: StockMovement }>;
}

export class StockMovementService implements IStockMovementService {
  constructor(private readonly api: AxiosInstance) {}

  async list(filter: StockMovementListFilter = {}): Promise<{ data: StockMovement[] }> {
    const params: Record<string, string> = {};
    if (filter.product_id) params.product_id = filter.product_id;
    if (filter.category_id) params.category_id = filter.category_id;
    if (filter.warehouse_id) params.warehouse_id = filter.warehouse_id;
    if (filter.type) params.type = filter.type;
    if (filter.search) params.search = filter.search;
    if (filter.date_from) params.date_from = filter.date_from;
    if (filter.date_to) params.date_to = filter.date_to;

    const { data } = await this.api.get('/stock-movements', { params });
    return data;
  }

  async create(params: StockMovementParams): Promise<{ data: StockMovement }> {
    const { data } = await this.api.post('/stock-movements', params);
    return data;
  }
}
