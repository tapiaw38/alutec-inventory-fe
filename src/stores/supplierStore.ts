import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ISupplierService, SupplierParams } from '@/services/suppliers/supplierService';
import type { Supplier } from '@/types/inventory';

export const useSupplierStore = (service: ISupplierService) =>
  defineStore('suppliers', () => {
    const suppliers = ref<Supplier[]>([]);
    const loading = ref(false);

    const fetchSuppliers = async () => {
      loading.value = true;
      try {
        const response = await service.list();
        suppliers.value = response.data || [];
        return suppliers.value;
      } finally {
        loading.value = false;
      }
    };

    const createSupplier = async (params: SupplierParams) => {
      loading.value = true;
      try {
        const response = await service.create(params);
        suppliers.value.push(response.data);
        return response.data;
      } finally {
        loading.value = false;
      }
    };

    const updateSupplier = async (id: string, params: SupplierParams) => {
      loading.value = true;
      try {
        const response = await service.update(id, params);
        const index = suppliers.value.findIndex((s) => s.id === id);
        if (index !== -1) suppliers.value[index] = response.data;
        return response.data;
      } finally {
        loading.value = false;
      }
    };

    const deleteSupplier = async (id: string) => {
      loading.value = true;
      try {
        await service.delete(id);
        suppliers.value = suppliers.value.filter((s) => s.id !== id);
      } finally {
        loading.value = false;
      }
    };

    return {
      suppliers,
      loading,
      fetchSuppliers,
      createSupplier,
      updateSupplier,
      deleteSupplier,
    };
  });
