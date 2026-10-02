import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { inventoryApi } from '@/api/request/server';
import {
  StockMovementService,
  type StockMovementParams,
  type StockMovementListFilter,
} from '@/services/stockMovements/stockMovementService';
import { useStockMovementStore } from '@/stores/stockMovementStore';
import { useProduct } from '@/composables/useProduct';

// Append-only ledger: this composable intentionally exposes no update or
// delete action. To correct a mistake, create a new movement that reverses it.
export const useStockMovement = () => {
  const $q = useQuasar();
  const service = new StockMovementService(inventoryApi);
  const store = useStockMovementStore(service)();
  const { stockMovements, loading } = storeToRefs(store);
  const { applyStockDelta } = useProduct();

  const loadStockMovements = async (filter?: StockMovementListFilter) => {
    try {
      return await store.fetchStockMovements(filter);
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudieron cargar los movimientos' });
      throw new Error('load-stock-movements-failed');
    }
  };

  const createStockMovement = async (params: StockMovementParams) => {
    try {
      const movement = await store.createStockMovement(params);
      const delta = params.type === 'out' ? -params.quantity : params.quantity;
      applyStockDelta(params.product_id, delta);
      $q.notify({ type: 'positive', message: 'Movimiento registrado correctamente' });
      return movement;
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudo registrar el movimiento' });
      throw new Error('create-stock-movement-failed');
    }
  };

  return {
    stockMovements,
    loading,
    loadStockMovements,
    createStockMovement,
  };
};
