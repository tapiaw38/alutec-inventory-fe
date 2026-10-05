import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
  IProductService,
  ProductParams,
  ProductListFilter,
} from '@/services/products/productService';
import type { Product } from '@/types/inventory';

export const useProductStore = (service: IProductService) =>
  defineStore('products', () => {
    const products = ref<Product[]>([]);
    const loading = ref(false);

    const fetchProducts = async (filter?: ProductListFilter) => {
      loading.value = true;
      try {
        const response = await service.list(filter);
        products.value = response.data || [];
        return products.value;
      } finally {
        loading.value = false;
      }
    };

    const createProduct = async (params: ProductParams) => {
      loading.value = true;
      try {
        const response = await service.create(params);
        products.value.push(response.data);
        return response.data;
      } finally {
        loading.value = false;
      }
    };

    const updateProduct = async (id: string, params: Omit<ProductParams, 'stock_qty' | 'warehouse_id'>) => {
      loading.value = true;
      try {
        const response = await service.update(id, params);
        const index = products.value.findIndex((p) => p.id === id);
        if (index !== -1) products.value[index] = response.data;
        return response.data;
      } finally {
        loading.value = false;
      }
    };

    const deleteProduct = async (id: string) => {
      loading.value = true;
      try {
        const result = await service.delete(id);
        products.value = products.value.filter((p) => p.id !== id);
        return result;
      } finally {
        loading.value = false;
      }
    };

    return {
      products,
      loading,
      fetchProducts,
      createProduct,
      updateProduct,
      deleteProduct,
    };
  });
