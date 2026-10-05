<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <img src="~@/assets/alutec-logo.png" alt="Alutec" class="app-logo q-mx-sm" />
        <q-toolbar-title>Alutec</q-toolbar-title>
        <q-btn flat dense round icon="logout" aria-label="Cerrar sesión" @click="confirmLogout = true">
          <q-tooltip>Cerrar sesión</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="moreDrawerOpen" side="right" overlay bordered>
      <q-list>
        <q-item-label header class="text-weight-bold" style="letter-spacing: 0.08em">
          MÁS OPCIONES
        </q-item-label>

        <q-item
          v-for="link in moreLinks"
          :key="link.to"
          clickable
          v-close-popup
          :to="link.to"
          exact
          active-class="nav-link--active"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>{{ link.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-dialog v-model="confirmLogout">
      <q-card style="width: 320px; max-width: 92vw">
        <q-card-section class="text-subtitle1">¿Cerrar sesión?</q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat color="primary" label="Salir" no-caps @click="doLogout" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-page-container>
      <div class="page-container-wrap">
        <router-view />
      </div>
    </q-page-container>

    <q-footer bordered class="bg-white">
      <div class="row items-center justify-around bottom-nav bottom-nav-wrap">
        <q-btn
          flat
          stack
          no-caps
          dense
          to="/"
          exact
          icon="dashboard"
          label="Resumen"
          class="bottom-nav__btn"
        />
        <q-btn
          flat
          stack
          no-caps
          dense
          to="/products"
          icon="inventory_2"
          label="Productos"
          class="bottom-nav__btn"
        />

        <q-btn round color="primary" icon="qr_code_scanner" class="bottom-nav__scan" @click="handleScan">
          <q-tooltip>Escanear código</q-tooltip>
        </q-btn>

        <q-btn
          flat
          stack
          no-caps
          dense
          to="/movements"
          icon="swap_horiz"
          label="Movimientos"
          class="bottom-nav__btn"
        />
        <q-btn
          flat
          stack
          no-caps
          dense
          icon="more_horiz"
          label="Más"
          class="bottom-nav__btn"
          @click="moreDrawerOpen = true"
        />
      </div>
    </q-footer>

    <!-- Web camera fallback (non-Android / no native scanner) -->
    <CameraScannerDialog v-model="cameraScannerOpen" @detected="handleScanResult" />

    <!-- Quick actions after a successful scan -->
    <q-dialog v-model="quickActionOpen">
      <q-card style="width: 360px; max-width: 95vw">
        <q-card-section class="row items-center no-wrap">
          <div>
            <div class="text-h6">{{ scannedProduct?.name }}</div>
            <div class="text-caption text-grey-7">SKU: {{ scannedProduct?.sku }}</div>
            <div class="text-caption">
              Stock actual: <span class="text-weight-bold">{{ scannedProduct?.stock_qty }}</span>
              {{ scannedProduct?.unit }}
            </div>
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="row q-col-gutter-md">
          <div class="col-12">
            <div class="text-caption text-grey-7 text-center q-mb-xs">Cantidad</div>
            <div class="row items-center justify-center q-gutter-lg">
              <q-btn round color="negative" icon="remove" @click="quickQty = Math.max(1, quickQty - 1)" />
              <div class="text-h5 text-weight-bold text-center" style="min-width: 40px">{{ quickQty }}</div>
              <q-btn round color="positive" icon="add" @click="quickQty = quickQty + 1" />
            </div>
          </div>
          <q-select
            v-model="quickWarehouseId"
            :options="warehouseOptions"
            emit-value
            map-options
            class="col-12"
            label="Depósito"
            dense
            outlined
          />
        </q-card-section>

        <q-card-actions vertical class="q-pa-md q-gutter-sm">
          <q-btn
            outline
            color="negative"
            label="Vender"
            no-caps
            class="full-width"
            @click="quickMove('out')"
          />
          <q-btn
            color="positive"
            label="Agregar stock"
            no-caps
            class="full-width"
            @click="quickMove('in')"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuth } from '@/composables/useAuth';
import { useProduct } from '@/composables/useProduct';
import { useWarehouse } from '@/composables/useWarehouse';
import { useStockMovement } from '@/composables/useStockMovement';
import CameraScannerDialog from '@/components/CameraScannerDialog.vue';
import type { Product, StockMovementType } from '@/types/inventory';
import { scanBarcode, ScannerPermissionDeniedError, ScannerUnavailableError } from '@/composables/useBarcodeScanner';

const $q = useQuasar();
const router = useRouter();
const { logout } = useAuth();
const { products, loadProducts } = useProduct();
const { warehouses, loadWarehouses } = useWarehouse();
const { createStockMovement } = useStockMovement();

onMounted(() => {
  void loadProducts();
  void loadWarehouses();
});

const moreLinks = [
  { label: 'Categorías', to: '/categories', icon: 'category' },
  { label: 'Proveedores', to: '/suppliers', icon: 'local_shipping' },
  { label: 'Depósitos', to: '/warehouses', icon: 'warehouse' },
];

const moreDrawerOpen = ref(false);

const confirmLogout = ref(false);

async function doLogout() {
  logout();
  await router.replace('/login');
}

const quickActionOpen = ref(false);
const scannedProduct = ref<Product | null>(null);
const quickQty = ref(1);
const quickWarehouseId = ref('');
const cameraScannerOpen = ref(false);

const warehouseOptions = ref<{ label: string; value: string }[]>([]);
watch(
  warehouses,
  (list) => {
    warehouseOptions.value = list.map((w) => ({ label: w.name, value: w.id }));
    if (!quickWarehouseId.value) quickWarehouseId.value = warehouseOptions.value[0]?.value ?? '';
  },
  { immediate: true },
);

function resolveScannedValue(value: string | null) {
  if (!value) return;

  const product = products.value.find((p) => p.sku === value);
  if (!product) {
    $q.notify({ type: 'warning', message: `Producto no encontrado para el código: ${value}` });
    return;
  }

  scannedProduct.value = product;
  quickQty.value = 1;
  quickWarehouseId.value = warehouseOptions.value[0]?.value ?? '';
  quickActionOpen.value = true;
}

async function handleScan() {
  try {
    const value = await scanBarcode();
    resolveScannedValue(value);
  } catch (error) {
    if (error instanceof ScannerUnavailableError) {
      // Not running as a native Android/iOS app: fall back to the browser camera.
      cameraScannerOpen.value = true;
      return;
    }
    if (error instanceof ScannerPermissionDeniedError) {
      $q.notify({ type: 'negative', message: error.message });
      return;
    }
    $q.notify({ type: 'negative', message: 'No se pudo escanear el código.' });
  }
}

function handleScanResult(value: string) {
  resolveScannedValue(value);
}

async function quickMove(type: StockMovementType) {
  if (!scannedProduct.value || quickQty.value <= 0) return;

  try {
    await createStockMovement({
      product_id: scannedProduct.value.id,
      warehouse_id: quickWarehouseId.value,
      type,
      quantity: quickQty.value,
      date: new Date().toISOString().slice(0, 10),
      note: type === 'out' ? 'Venta rápida (escaneo)' : 'Reposición rápida (escaneo)',
    });
    quickActionOpen.value = false;
  } catch {
    // feedback already shown by the composable
  }
}
</script>

<style scoped lang="scss">
.app-logo {
  height: 32px;
  width: 32px;
  object-fit: contain;
}

:deep(.nav-link--active) {
  color: var(--q-primary);
  background: color-mix(in srgb, var(--q-primary) 8%, transparent);
  font-weight: 600;
}

.page-container-wrap {
  max-width: 960px;
  margin: 0 auto;
}

.bottom-nav {
  padding: 4px 0 6px;
}

.bottom-nav-wrap {
  max-width: 960px;
  margin: 0 auto;
}

.bottom-nav__btn {
  color: rgba(0, 0, 0, 0.54);
  min-width: 56px;
  font-size: 11px;

  :deep(.q-icon) {
    font-size: 22px;
  }

  &.router-link-exact-active {
    color: var(--q-primary);
  }
}

.bottom-nav__scan {
  width: 56px;
  height: 56px;
  margin-top: -28px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  border: 4px solid white;
}
</style>
