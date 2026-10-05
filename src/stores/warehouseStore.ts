import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { IWarehouseService, WarehouseParams } from '@/services/warehouses/warehouseService';
import type { Warehouse } from '@/types/inventory';

export const useWarehouseStore = (service: IWarehouseService) =>
  defineStore('warehouses', () => {
    const warehouses = ref<Warehouse[]>([]);
    const loading = ref(false);

    const fetchWarehouses = async () => {
      loading.value = true;
      try {
        const response = await service.list();
        warehouses.value = response.data || [];
        return warehouses.value;
      } finally {
        loading.value = false;
      }
    };

    const createWarehouse = async (params: WarehouseParams) => {
      loading.value = true;
      try {
        const response = await service.create(params);
        warehouses.value.push(response.data);
        return response.data;
      } finally {
        loading.value = false;
      }
    };

    const updateWarehouse = async (id: string, params: WarehouseParams) => {
      loading.value = true;
      try {
        const response = await service.update(id, params);
        const index = warehouses.value.findIndex((w) => w.id === id);
        if (index !== -1) warehouses.value[index] = response.data;
        return response.data;
      } finally {
        loading.value = false;
      }
    };

    const deleteWarehouse = async (id: string) => {
      loading.value = true;
      try {
        const result = await service.delete(id);
        warehouses.value = warehouses.value.filter((w) => w.id !== id);
        return result;
      } finally {
        loading.value = false;
      }
    };

    return {
      warehouses,
      loading,
      fetchWarehouses,
      createWarehouse,
      updateWarehouse,
      deleteWarehouse,
    };
  });
