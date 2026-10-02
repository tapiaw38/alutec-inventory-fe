import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
  IStockMovementService,
  StockMovementParams,
  StockMovementListFilter,
} from '@/services/stockMovements/stockMovementService';
import type { StockMovement } from '@/types/inventory';

// Append-only ledger: this store intentionally has no update or delete
// action. To correct a mistake, create a new movement that reverses it.
export const useStockMovementStore = (service: IStockMovementService) =>
  defineStore('stockMovements', () => {
    const stockMovements = ref<StockMovement[]>([]);
    const loading = ref(false);

    const fetchStockMovements = async (filter?: StockMovementListFilter) => {
      loading.value = true;
      try {
        const response = await service.list(filter);
        stockMovements.value = response.data || [];
        return stockMovements.value;
      } finally {
        loading.value = false;
      }
    };

    const createStockMovement = async (params: StockMovementParams) => {
      loading.value = true;
      try {
        const response = await service.create(params);
        stockMovements.value.unshift(response.data);
        return response.data;
      } finally {
        loading.value = false;
      }
    };

    return {
      stockMovements,
      loading,
      fetchStockMovements,
      createStockMovement,
    };
  });
