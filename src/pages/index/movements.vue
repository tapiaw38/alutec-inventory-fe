<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5">Movimientos de Stock</div>
      <q-space />
      <q-btn dense color="primary" icon="add" label="Nuevo" no-caps @click="openCreate" />
    </div>

    <div class="row items-center no-wrap q-gutter-sm q-mb-md">
      <q-input v-model="search" class="col" dense outlined clearable placeholder="Buscar por producto o nota">
        <template #prepend><q-icon name="search" /></template>
      </q-input>

      <q-btn flat dense :color="typeFilter ? 'secondary' : 'grey-7'" icon="swap_horiz">
        <q-badge v-if="typeFilter" floating color="secondary" rounded />
        <q-tooltip>Tipo</q-tooltip>
        <q-menu>
          <q-list style="min-width: 140px">
            <q-item clickable v-close-popup @click="typeFilter = null">
              <q-item-section>Todos</q-item-section>
            </q-item>
            <q-separator />
            <q-item
              v-for="t in typeOptions"
              :key="t.value"
              clickable
              v-close-popup
              :active="typeFilter === t.value"
              @click="typeFilter = t.value"
            >
              <q-item-section>{{ t.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <q-btn flat dense :color="categoryFilter ? 'secondary' : 'grey-7'" icon="category">
        <q-badge v-if="categoryFilter" floating color="secondary" rounded />
        <q-tooltip>Categoría</q-tooltip>
        <q-menu>
          <q-list style="min-width: 160px">
            <q-item clickable v-close-popup @click="categoryFilter = null">
              <q-item-section>Todas</q-item-section>
            </q-item>
            <q-separator />
            <q-item
              v-for="c in categoryOptions"
              :key="c.value"
              clickable
              v-close-popup
              :active="categoryFilter === c.value"
              @click="categoryFilter = c.value"
            >
              <q-item-section>{{ c.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <q-btn flat dense :color="warehouseFilter ? 'secondary' : 'grey-7'" icon="warehouse">
        <q-badge v-if="warehouseFilter" floating color="secondary" rounded />
        <q-tooltip>Depósito</q-tooltip>
        <q-menu>
          <q-list style="min-width: 160px">
            <q-item clickable v-close-popup @click="warehouseFilter = null">
              <q-item-section>Todos</q-item-section>
            </q-item>
            <q-separator />
            <q-item
              v-for="w in warehouseOptions"
              :key="w.value"
              clickable
              v-close-popup
              :active="warehouseFilter === w.value"
              @click="warehouseFilter = w.value"
            >
              <q-item-section>{{ w.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <q-btn flat dense :color="dateFrom || dateTo ? 'secondary' : 'grey-7'" icon="event">
        <q-badge v-if="dateFrom || dateTo" floating color="secondary" rounded />
        <q-tooltip>Rango de fecha</q-tooltip>
        <q-menu>
          <div class="q-pa-md q-gutter-sm" style="width: 220px">
            <q-input v-model="dateFrom" type="date" label="Desde" dense outlined clearable />
            <q-input v-model="dateTo" type="date" label="Hasta" dense outlined clearable />
          </div>
        </q-menu>
      </q-btn>
    </div>

    <q-table
      flat
      bordered
      :rows="stockMovements"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :grid="$q.screen.lt.sm"
    >
      <template #item="props">
        <div class="col-12 q-mb-sm">
          <q-card flat bordered>
            <q-card-section>
              <div class="row items-center justify-between">
                <div class="text-weight-medium">{{ productName(props.row.product_id) }}</div>
                <q-badge :color="typeColor(props.row.type)">{{ typeLabel(props.row.type) }}</q-badge>
              </div>
              <div class="text-caption text-grey-7">{{ warehouseName(props.row.warehouse_id) }} · {{ props.row.date }}</div>
              <div class="text-caption">
                Cantidad: <span class="text-weight-bold">{{ props.row.quantity }}</span>
              </div>
              <div v-if="props.row.note" class="text-caption text-grey-7">{{ props.row.note }}</div>
            </q-card-section>
          </q-card>
        </div>
      </template>

      <template #body-cell-product="props">
        <q-td :props="props">{{ productName(props.row.product_id) }}</q-td>
      </template>
      <template #body-cell-warehouse="props">
        <q-td :props="props">{{ warehouseName(props.row.warehouse_id) }}</q-td>
      </template>
      <template #body-cell-type="props">
        <q-td :props="props">
          <q-badge :color="typeColor(props.value)">{{ typeLabel(props.value) }}</q-badge>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialogOpen">
      <q-card style="width: 400px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">Nuevo movimiento</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-select
            v-model="form.product_id"
            :options="productOptions"
            emit-value
            map-options
            label="Producto"
            dense
            outlined
          />
          <q-select
            v-model="form.warehouse_id"
            :options="warehouseOptions"
            emit-value
            map-options
            label="Depósito"
            dense
            outlined
          />
          <q-select
            v-model="form.type"
            :options="typeOptions"
            emit-value
            map-options
            label="Tipo"
            dense
            outlined
          />
          <q-input v-model.number="form.quantity" type="number" label="Cantidad" dense outlined />
          <q-input v-model="form.date" type="date" label="Fecha" dense outlined />
          <q-input v-model="form.note" label="Nota" dense outlined />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Guardar" no-caps :loading="loading" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import type { QTableColumn } from 'quasar';
import { useStockMovement } from '@/composables/useStockMovement';
import { useProduct } from '@/composables/useProduct';
import { useWarehouse } from '@/composables/useWarehouse';
import { useCategory } from '@/composables/useCategory';
import type { StockMovementType } from '@/types/inventory';
import type { StockMovementParams } from '@/services/stockMovements/stockMovementService';

const { stockMovements, loading, loadStockMovements, createStockMovement } = useStockMovement();
const { products, loadProducts } = useProduct();
const { warehouses, loadWarehouses } = useWarehouse();
const { categories, loadCategories } = useCategory();

const columns: QTableColumn[] = [
  { name: 'date', label: 'Fecha', field: 'date', align: 'left', sortable: true },
  { name: 'product', label: 'Producto', field: 'product_id', align: 'left' },
  { name: 'warehouse', label: 'Depósito', field: 'warehouse_id', align: 'left' },
  { name: 'type', label: 'Tipo', field: 'type', align: 'left' },
  { name: 'quantity', label: 'Cantidad', field: 'quantity', align: 'left', sortable: true },
  { name: 'note', label: 'Nota', field: 'note', align: 'left' },
];

// Derived, not watched: the stores are shared, so these lists can already be
// populated on mount and a non-immediate watch would never fire for them.
const productOptions = computed(() =>
  products.value.map((p) => ({ label: `${p.sku} · ${p.name}`, value: p.id })),
);
const warehouseOptions = computed(() => warehouses.value.map((w) => ({ label: w.name, value: w.id })));
const categoryOptions = computed(() => categories.value.map((c) => ({ label: c.name, value: c.id })));

const typeOptions: { label: string; value: StockMovementType }[] = [
  { label: 'Entrada', value: 'in' },
  { label: 'Salida', value: 'out' },
  { label: 'Ajuste', value: 'adjustment' },
];

function productName(id: string) {
  return products.value.find((p) => p.id === id)?.name ?? '-';
}
function warehouseName(id: string) {
  return warehouses.value.find((w) => w.id === id)?.name ?? '-';
}
function typeLabel(type: StockMovementType) {
  return typeOptions.find((o) => o.value === type)?.label ?? type;
}
function typeColor(type: StockMovementType) {
  return type === 'in' ? 'positive' : type === 'out' ? 'negative' : 'warning';
}

const search = ref('');
const typeFilter = ref<StockMovementType | null>(null);
const categoryFilter = ref<string | null>(null);
const warehouseFilter = ref<string | null>(null);
const dateFrom = ref<string | null>(null);
const dateTo = ref<string | null>(null);

function refreshList() {
  return loadStockMovements({
    search: search.value || undefined,
    type: typeFilter.value || undefined,
    category_id: categoryFilter.value || undefined,
    warehouse_id: warehouseFilter.value || undefined,
    date_from: dateFrom.value || undefined,
    date_to: dateTo.value || undefined,
  });
}

let searchTimeout: ReturnType<typeof setTimeout> | undefined;
watch(search, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => void refreshList(), 300);
});
watch([typeFilter, categoryFilter, warehouseFilter, dateFrom, dateTo], () => void refreshList());

onMounted(() => {
  void loadProducts();
  void loadWarehouses();
  void loadCategories();
  void refreshList();
});

const dialogOpen = ref(false);
const form = reactive<StockMovementParams>({
  product_id: '',
  warehouse_id: '',
  type: 'in',
  quantity: 1,
  date: new Date().toISOString().slice(0, 10),
  note: '',
});

function openCreate() {
  Object.assign(form, {
    product_id: productOptions.value[0]?.value ?? '',
    warehouse_id: warehouseOptions.value[0]?.value ?? '',
    type: 'in',
    quantity: 1,
    date: new Date().toISOString().slice(0, 10),
    note: '',
  });
  dialogOpen.value = true;
}

async function save() {
  try {
    await createStockMovement({ ...form });
    dialogOpen.value = false;
    await refreshList();
  } catch {
    // feedback already shown by the composable
  }
}
</script>
