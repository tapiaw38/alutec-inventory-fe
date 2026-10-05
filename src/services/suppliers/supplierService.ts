import type { AxiosInstance } from 'axios';
import type { DeleteResult } from '@/services/products/productService';
import type { Supplier } from '@/types/inventory';

export interface SupplierParams {
  name: string;
  phone: string;
  email: string;
}

export interface ISupplierService {
  list(): Promise<{ data: Supplier[] }>;
  create(params: SupplierParams): Promise<{ data: Supplier }>;
  update(id: string, params: SupplierParams): Promise<{ data: Supplier }>;
  delete(id: string): Promise<DeleteResult>;
}

export class SupplierService implements ISupplierService {
  constructor(private readonly api: AxiosInstance) {}

  async list(): Promise<{ data: Supplier[] }> {
    const { data } = await this.api.get('/suppliers');
    return data;
  }

  async create(params: SupplierParams): Promise<{ data: Supplier }> {
    const { data } = await this.api.post('/suppliers', params);
    return data;
  }

  async update(id: string, params: SupplierParams): Promise<{ data: Supplier }> {
    const { data } = await this.api.put(`/suppliers/${id}`, params);
    return data;
  }

  async delete(id: string): Promise<DeleteResult> {
    const { data } = await this.api.delete(`/suppliers/${id}`);
    return data.data ?? { archived: false };
  }
}
