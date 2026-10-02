import type { AxiosInstance } from 'axios';
import type { Product } from '@/types/inventory';

export interface ProductParams {
  sku: string;
  name: string;
  category_id: string;
  supplier_id: string;
  unit: string;
  cost_price: number;
  sale_price: number;
  min_stock: number;
  stock_qty?: number;
  image_url: string;
}

export interface ProductListFilter {
  category_id?: string | undefined;
  supplier_id?: string | undefined;
  search?: string | undefined;
  low_stock?: boolean | undefined;
}

export interface ImportRowError {
  row: number;
  message: string;
}

export interface ImportResult {
  imported: number;
  errors: ImportRowError[] | null;
}

export interface IProductService {
  list(filter?: ProductListFilter): Promise<{ data: Product[] }>;
  create(params: ProductParams): Promise<{ data: Product }>;
  update(id: string, params: Omit<ProductParams, 'stock_qty'>): Promise<{ data: Product }>;
  delete(id: string): Promise<void>;
  downloadImportTemplate(): Promise<Blob>;
  importFile(file: File): Promise<ImportResult>;
}

export class ProductService implements IProductService {
  constructor(private readonly api: AxiosInstance) {}

  async list(filter: ProductListFilter = {}): Promise<{ data: Product[] }> {
    const params: Record<string, string> = {};
    if (filter.category_id) params.category_id = filter.category_id;
    if (filter.supplier_id) params.supplier_id = filter.supplier_id;
    if (filter.search) params.search = filter.search;
    if (filter.low_stock) params.low_stock = 'true';

    const { data } = await this.api.get('/products', { params });
    return data;
  }

  async create(params: ProductParams): Promise<{ data: Product }> {
    const { data } = await this.api.post('/products', params);
    return data;
  }

  async update(id: string, params: Omit<ProductParams, 'stock_qty'>): Promise<{ data: Product }> {
    const { data } = await this.api.put(`/products/${id}`, params);
    return data;
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(`/products/${id}`);
  }

  async downloadImportTemplate(): Promise<Blob> {
    const { data } = await this.api.get('/products/import-template', { responseType: 'blob' });
    return data;
  }

  async importFile(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await this.api.post('/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }
}
