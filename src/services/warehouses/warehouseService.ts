import type { AxiosInstance } from 'axios';
import type { Warehouse } from '@/types/inventory';

export interface WarehouseParams {
  name: string;
  location: string;
}

export interface IWarehouseService {
  list(): Promise<{ data: Warehouse[] }>;
  create(params: WarehouseParams): Promise<{ data: Warehouse }>;
  update(id: string, params: WarehouseParams): Promise<{ data: Warehouse }>;
  delete(id: string): Promise<void>;
}

export class WarehouseService implements IWarehouseService {
  constructor(private readonly api: AxiosInstance) {}

  async list(): Promise<{ data: Warehouse[] }> {
    const { data } = await this.api.get('/warehouses');
    return data;
  }

  async create(params: WarehouseParams): Promise<{ data: Warehouse }> {
    const { data } = await this.api.post('/warehouses', params);
    return data;
  }

  async update(id: string, params: WarehouseParams): Promise<{ data: Warehouse }> {
    const { data } = await this.api.put(`/warehouses/${id}`, params);
    return data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/warehouses/${id}`);
  }
}
