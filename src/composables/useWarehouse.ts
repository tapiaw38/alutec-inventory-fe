import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { inventoryApi } from '@/api/request/server';
import { WarehouseService, type WarehouseParams } from '@/services/warehouses/warehouseService';
import { useWarehouseStore } from '@/stores/warehouseStore';
import { apiMessage } from '@/utils/apiError';

export const useWarehouse = () => {
  const $q = useQuasar();
  const service = new WarehouseService(inventoryApi);
  const store = useWarehouseStore(service)();
  const { warehouses, loading } = storeToRefs(store);

  const loadWarehouses = async () => {
    try {
      return await store.fetchWarehouses();
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudieron cargar los depósitos' });
      throw new Error('load-warehouses-failed');
    }
  };

  const createWarehouse = async (params: WarehouseParams) => {
    try {
      const warehouse = await store.createWarehouse(params);
      $q.notify({ type: 'positive', message: 'Depósito creado correctamente' });
      return warehouse;
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudo crear el depósito' });
      throw new Error('create-warehouse-failed');
    }
  };

  const updateWarehouse = async (id: string, params: WarehouseParams) => {
    try {
      const warehouse = await store.updateWarehouse(id, params);
      $q.notify({ type: 'positive', message: 'Depósito actualizado correctamente' });
      return warehouse;
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudo actualizar el depósito' });
      throw new Error('update-warehouse-failed');
    }
  };

  const deleteWarehouse = async (id: string) => {
    try {
      const result = await store.deleteWarehouse(id);
      $q.notify({
        type: 'positive',
        message: result?.archived
          ? 'Depósito archivado: tiene movimientos, su historial se conserva'
          : 'Depósito eliminado correctamente',
      });
      return result;
    } catch (error) {
      $q.notify({ type: 'negative', message: apiMessage(error, 'No se pudo eliminar el depósito') });
      throw new Error('delete-warehouse-failed', { cause: error });
    }
  };

  return {
    warehouses,
    loading,
    loadWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
  };
};
