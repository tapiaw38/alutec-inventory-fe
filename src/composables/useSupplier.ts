import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { inventoryApi } from '@/api/request/server';
import { SupplierService, type SupplierParams } from '@/services/suppliers/supplierService';
import { useSupplierStore } from '@/stores/supplierStore';

export const useSupplier = () => {
  const $q = useQuasar();
  const service = new SupplierService(inventoryApi);
  const store = useSupplierStore(service)();
  const { suppliers, loading } = storeToRefs(store);

  const loadSuppliers = async () => {
    try {
      return await store.fetchSuppliers();
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudieron cargar los proveedores' });
      throw new Error('load-suppliers-failed');
    }
  };

  const createSupplier = async (params: SupplierParams) => {
    try {
      const supplier = await store.createSupplier(params);
      $q.notify({ type: 'positive', message: 'Proveedor creado correctamente' });
      return supplier;
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudo crear el proveedor' });
      throw new Error('create-supplier-failed');
    }
  };

  const updateSupplier = async (id: string, params: SupplierParams) => {
    try {
      const supplier = await store.updateSupplier(id, params);
      $q.notify({ type: 'positive', message: 'Proveedor actualizado correctamente' });
      return supplier;
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudo actualizar el proveedor' });
      throw new Error('update-supplier-failed');
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      await store.deleteSupplier(id);
      $q.notify({ type: 'positive', message: 'Proveedor eliminado correctamente' });
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudo eliminar el proveedor' });
      throw new Error('delete-supplier-failed');
    }
  };

  return {
    suppliers,
    loading,
    loadSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
};
