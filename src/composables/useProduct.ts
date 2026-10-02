import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { inventoryApi } from '@/api/request/server';
import {
  ProductService,
  type ProductParams,
  type ProductListFilter,
} from '@/services/products/productService';
import { useProductStore } from '@/stores/productStore';

export const useProduct = () => {
  const $q = useQuasar();
  const service = new ProductService(inventoryApi);
  const store = useProductStore(service)();
  const { products, loading } = storeToRefs(store);

  const loadProducts = async (filter?: ProductListFilter) => {
    try {
      return await store.fetchProducts(filter);
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudieron cargar los productos' });
      throw new Error('load-products-failed');
    }
  };

  const createProduct = async (params: ProductParams) => {
    try {
      const product = await store.createProduct(params);
      $q.notify({ type: 'positive', message: 'Producto creado correctamente' });
      return product;
    } catch (error) {
      const message = axiosMessage(error, 'No se pudo crear el producto');
      $q.notify({ type: 'negative', message });
      throw new Error('create-product-failed', { cause: error });
    }
  };

  const updateProduct = async (id: string, params: Omit<ProductParams, 'stock_qty'>) => {
    try {
      const product = await store.updateProduct(id, params);
      $q.notify({ type: 'positive', message: 'Producto actualizado correctamente' });
      return product;
    } catch (error) {
      const message = axiosMessage(error, 'No se pudo actualizar el producto');
      $q.notify({ type: 'negative', message });
      throw new Error('update-product-failed', { cause: error });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await store.deleteProduct(id);
      $q.notify({ type: 'positive', message: 'Producto eliminado correctamente' });
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudo eliminar el producto' });
      throw new Error('delete-product-failed');
    }
  };

  const downloadImportTemplate = async () => {
    try {
      const blob = await service.downloadImportTemplate();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'plantilla-productos.xlsx';
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudo descargar la plantilla' });
      throw new Error('download-template-failed');
    }
  };

  const importProducts = async (file: File) => {
    try {
      const result = await service.importFile(file);
      await loadProducts();
      return result;
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudo importar el archivo' });
      throw new Error('import-products-failed');
    }
  };

  return {
    products,
    loading,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    downloadImportTemplate,
    importProducts,
    applyStockDelta: store.applyStockDelta,
  };
};

function axiosMessage(error: unknown, fallback: string): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message ===
      'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data.message;
  }
  return fallback;
}
