import type { AxiosInstance } from 'axios';
import type { Category, CategoryType } from '@/types/inventory';

export interface CategoryParams {
  name: string;
  type: CategoryType;
}

export interface ICategoryService {
  list(): Promise<{ data: Category[] }>;
  create(params: CategoryParams): Promise<{ data: Category }>;
  update(id: string, params: CategoryParams): Promise<{ data: Category }>;
  delete(id: string): Promise<void>;
}

export class CategoryService implements ICategoryService {
  constructor(private readonly api: AxiosInstance) {}

  async list(): Promise<{ data: Category[] }> {
    const { data } = await this.api.get('/categories');
    return data;
  }

  async create(params: CategoryParams): Promise<{ data: Category }> {
    const { data } = await this.api.post('/categories', params);
    return data;
  }

  async update(id: string, params: CategoryParams): Promise<{ data: Category }> {
    const { data } = await this.api.put(`/categories/${id}`, params);
    return data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/categories/${id}`);
  }
}
