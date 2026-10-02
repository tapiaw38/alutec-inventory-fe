<template>
  <q-page padding class="dashboard-page">
    <div class="q-mb-lg">
      <div class="text-overline text-secondary dashboard-eyebrow">Inicio</div>
      <div class="text-caption text-grey-7">{{ formattedDate }}</div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-6">
        <StatCard icon="inventory_2" label="Productos" :value="products.length" color="primary" />
      </div>
      <div class="col-6">
        <StatCard
          icon="warning"
          label="Stock bajo mínimo"
          :value="lowStockCount"
          :color="lowStockCount > 0 ? 'negative' : 'positive'"
        />
      </div>
      <div class="col-6">
        <StatCard icon="local_shipping" label="Proveedores" :value="suppliers.length" color="secondary" />
      </div>
      <div class="col-6">
        <StatCard icon="warehouse" label="Depósitos" :value="warehouses.length" color="accent" />
      </div>
    </div>

    <div class="row q-mt-md">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section class="row items-center">
            <div class="text-subtitle1 text-weight-medium">Productos con stock bajo</div>
            <q-space />
            <q-btn flat dense no-caps color="primary" label="Ver más" to="/products" />
          </q-card-section>

          <q-separator />

          <q-list separator>
            <q-item v-for="p in lowStockPreview" :key="p.id">
              <q-item-section avatar>
                <q-avatar color="negative" text-color="white" icon="inventory_2" size="36px" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ p.name }}</q-item-label>
                <q-item-label caption>SKU: {{ p.sku }}</q-item-label>
                <q-linear-progress
                  :value="stockRatio(p)"
                  color="negative"
                  track-color="grey-3"
                  rounded
                  size="6px"
                  class="q-mt-xs"
                  style="max-width: 220px"
                />
              </q-item-section>
              <q-item-section side top>
                <div class="text-weight-bold text-negative">{{ p.stock_qty }}</div>
                <div class="text-caption text-grey-7">mín {{ p.min_stock }}</div>
              </q-item-section>
            </q-item>

            <q-item v-if="lowStockProducts.length === 0">
              <q-item-section class="text-grey-7">
                Todo el stock está por encima del mínimo.
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>

    <div class="row q-mt-md">
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section class="row items-center">
            <div class="text-subtitle1 text-weight-medium">Últimos movimientos</div>
            <q-space />
            <q-btn flat dense no-caps color="primary" label="Ver más" to="/movements" />
          </q-card-section>

          <q-separator />

          <q-list separator>
            <q-item v-for="m in recentMovements" :key="m.id">
              <q-item-section avatar>
                <q-avatar :color="movementColor(m.type)" text-color="white" :icon="movementIcon(m.type)" size="36px" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ productName(m.product_id) }}</q-item-label>
                <q-item-label caption>{{ warehouseName(m.warehouse_id) }} · {{ m.date }}</q-item-label>
              </q-item-section>
              <q-item-section side top>
                <q-badge :color="movementColor(m.type)">{{ movementLabel(m.type) }}</q-badge>
                <div class="text-caption text-grey-7 q-mt-xs">{{ m.quantity }} u.</div>
              </q-item-section>
            </q-item>

            <q-item v-if="recentMovements.length === 0">
              <q-item-section class="text-grey-7">Todavía no hay movimientos registrados.</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useProduct } from '@/composables/useProduct';
import { useSupplier } from '@/composables/useSupplier';
import { useWarehouse } from '@/composables/useWarehouse';
import { useStockMovement } from '@/composables/useStockMovement';
import StatCard from '@/components/StatCard.vue';
import type { Product, StockMovementType } from '@/types/inventory';

const { products, loadProducts } = useProduct();
const { suppliers, loadSuppliers } = useSupplier();
const { warehouses, loadWarehouses } = useWarehouse();
const { stockMovements, loadStockMovements } = useStockMovement();

onMounted(() => {
  void loadProducts();
  void loadSuppliers();
  void loadWarehouses();
  void loadStockMovements();
});

const lowStockProducts = computed(() => products.value.filter((p) => p.stock_qty <= p.min_stock));
const lowStockCount = computed(() => lowStockProducts.value.length);
const lowStockPreview = computed(() => lowStockProducts.value.slice(-4));

const recentMovements = computed(() => stockMovements.value.slice(0, 4));

function productName(id: string) {
  return products.value.find((p) => p.id === id)?.name ?? '-';
}
function warehouseName(id: string) {
  return warehouses.value.find((w) => w.id === id)?.name ?? '-';
}
function movementLabel(type: StockMovementType) {
  return type === 'in' ? 'Entrada' : type === 'out' ? 'Salida' : 'Ajuste';
}
function movementColor(type: StockMovementType) {
  return type === 'in' ? 'positive' : type === 'out' ? 'negative' : 'warning';
}
function movementIcon(type: StockMovementType) {
  return type === 'in' ? 'add' : type === 'out' ? 'remove' : 'tune';
}

function stockRatio(p: Product) {
  if (p.min_stock <= 0) return p.stock_qty > 0 ? 1 : 0;
  return Math.min(p.stock_qty / p.min_stock, 1);
}

const formattedDate = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}).format(new Date());
</script>

<style scoped lang="scss">
.dashboard-eyebrow {
  letter-spacing: 0.14em;
}
</style>
