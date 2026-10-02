<template>
  <q-page padding>
    <div class="row items-center q-mb-md q-gutter-sm">
      <div class="text-h5">Productos</div>
      <q-space />
      <q-btn
        v-if="selected.length > 0"
        dense
        outline
        color="primary"
        icon="print"
        :label="`Imprimir (${selected.length})`"
        no-caps
        @click="openPrintDialog"
      />
      <q-btn-dropdown dense outline color="primary" icon="description" label="Excel" no-caps>
        <q-list>
          <q-item clickable v-close-popup @click="downloadImportTemplate">
            <q-item-section avatar><q-icon name="download" /></q-item-section>
            <q-item-section>Descargar plantilla</q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="triggerImport">
            <q-item-section avatar><q-icon name="upload_file" /></q-item-section>
            <q-item-section>Importar Excel</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
      <input ref="fileInputRef" type="file" accept=".xlsx,.xls,.csv" class="hidden" @change="onFileSelected" />
      <q-btn dense color="primary" icon="add" label="Nuevo" no-caps @click="openCreate" />
    </div>

    <div class="row items-center no-wrap q-gutter-sm q-mb-md">
      <q-input v-model="search" class="col" dense outlined clearable placeholder="Buscar por nombre o SKU">
        <template #prepend><q-icon name="search" /></template>
      </q-input>

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

      <q-btn flat dense :color="supplierFilter ? 'secondary' : 'grey-7'" icon="local_shipping">
        <q-badge v-if="supplierFilter" floating color="secondary" rounded />
        <q-tooltip>Proveedor</q-tooltip>
        <q-menu>
          <q-list style="min-width: 180px">
            <q-item clickable v-close-popup @click="supplierFilter = null">
              <q-item-section>Todos</q-item-section>
            </q-item>
            <q-separator />
            <q-item
              v-for="s in supplierOptions"
              :key="s.value"
              clickable
              v-close-popup
              :active="supplierFilter === s.value"
              @click="supplierFilter = s.value"
            >
              <q-item-section>{{ s.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <q-btn
        flat
        dense
        :color="lowStockOnly ? 'negative' : 'grey-7'"
        icon="warning"
        @click="lowStockOnly = !lowStockOnly"
      >
        <q-tooltip>Solo stock bajo</q-tooltip>
      </q-btn>
    </div>

    <q-table
      flat
      bordered
      :rows="products"
      :columns="columns"
      row-key="id"
      selection="multiple"
      v-model:selected="selected"
      :loading="loading"
      :grid="$q.screen.lt.sm"
    >
      <template #item="props">
        <div class="col-12 q-mb-sm">
          <q-card flat bordered>
            <q-card-section class="row items-start no-wrap q-gutter-sm">
              <q-checkbox v-model="props.selected" dense />
              <q-avatar
                v-if="props.row.image_url"
                square
                size="48px"
                class="cursor-pointer product-thumb"
                @click="openPhotoViewer(props.row)"
              >
                <img :src="props.row.image_url" />
              </q-avatar>
              <q-avatar
                v-else
                square
                size="48px"
                color="grey-3"
                text-color="grey-6"
                icon="image"
                class="cursor-pointer"
                @click="openPhotoViewer(props.row)"
              />
              <div class="col">
                <div class="text-weight-medium">{{ props.row.name }}</div>
                <div class="text-caption text-grey-7">SKU: {{ props.row.sku }}</div>
                <div class="row items-center q-gutter-x-xs q-mt-xs">
                  <q-badge outline color="secondary">{{ categoryName(props.row.category_id) }}</q-badge>
                  <span class="text-caption text-grey-7">{{ supplierName(props.row.supplier_id) }}</span>
                </div>
                <div class="text-caption text-grey-7">Unidad: {{ props.row.unit }}</div>
              </div>
              <q-badge :color="stockColor(props.row)">
                {{ props.row.stock_qty }}
              </q-badge>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right">
              <q-btn flat dense round icon="qr_code_2" @click="openBarcode(props.row)" />
              <q-btn flat dense round icon="edit" @click="openEdit(props.row)" />
              <q-btn flat dense round icon="delete" color="negative" @click="confirmDelete(props.row)" />
            </q-card-actions>
          </q-card>
        </div>
      </template>

      <template #body-cell-image="props">
        <q-td :props="props">
          <q-avatar
            v-if="props.row.image_url"
            square
            size="40px"
            class="cursor-pointer product-thumb"
            @click="openPhotoViewer(props.row)"
          >
            <img :src="props.row.image_url" />
          </q-avatar>
          <q-avatar
            v-else
            square
            size="40px"
            color="grey-3"
            text-color="grey-6"
            icon="image"
            class="cursor-pointer"
            @click="openPhotoViewer(props.row)"
          />
        </q-td>
      </template>
      <template #body-cell-category="props">
        <q-td :props="props">
          <q-badge outline color="secondary">{{ categoryName(props.row.category_id) }}</q-badge>
        </q-td>
      </template>
      <template #body-cell-supplier="props">
        <q-td :props="props">{{ supplierName(props.row.supplier_id) }}</q-td>
      </template>
      <template #body-cell-stock_qty="props">
        <q-td :props="props">
          <q-badge :color="stockColor(props.row)">
            {{ props.value }}
          </q-badge>
        </q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props" class="text-right">
          <q-btn flat dense round icon="qr_code_2" @click="openBarcode(props.row)" />
          <q-btn flat dense round icon="edit" @click="openEdit(props.row)" />
          <q-btn flat dense round icon="delete" color="negative" @click="confirmDelete(props.row)" />
        </q-td>
      </template>
    </q-table>

    <!-- Create / edit dialog -->
    <q-dialog v-model="dialogOpen">
      <q-card style="width: 420px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">{{ editingId ? 'Editar producto' : 'Nuevo producto' }}</div>
        </q-card-section>

        <q-card-section class="row q-col-gutter-md">
          <div class="col-12 row items-center q-gutter-sm">
            <q-avatar v-if="form.image_url" square size="56px">
              <img :src="form.image_url" />
            </q-avatar>
            <q-avatar v-else square size="56px" color="grey-3" text-color="grey-6" icon="image" />
            <q-btn
              flat
              dense
              no-caps
              color="primary"
              icon="photo_camera"
              :label="form.image_url ? 'Cambiar foto' : 'Agregar foto'"
              @click="pickFormImage"
            />
          </div>
          <q-input
            v-model="form.sku"
            class="col-12"
            label="SKU"
            hint="Se usa como valor del código de barras (CODE128)"
            dense
            outlined
            autofocus
          >
            <template #append>
              <q-btn flat dense round icon="autorenew" @click="generateSku">
                <q-tooltip>Generar SKU</q-tooltip>
              </q-btn>
            </template>
          </q-input>
          <q-input v-model="form.name" class="col-12" label="Nombre" dense outlined />
          <q-select
            v-model="form.category_id"
            :options="categoryOptions"
            emit-value
            map-options
            class="col-12"
            label="Categoría"
            dense
            outlined
          />
          <q-select
            v-model="form.supplier_id"
            :options="supplierOptions"
            emit-value
            map-options
            class="col-12"
            label="Proveedor"
            dense
            outlined
          />
          <q-input v-model="form.unit" class="col-12" label="Unidad (pieza, m, m2, ...)" dense outlined />
          <q-input
            v-model.number="form.cost_price"
            class="col-12 col-sm-6 no-spin-input"
            type="number"
            min="0"
            step="0.01"
            prefix="$"
            label="Precio de costo"
            dense
            outlined
          />
          <q-input
            v-model.number="form.sale_price"
            class="col-12 col-sm-6 no-spin-input"
            type="number"
            min="0"
            step="0.01"
            prefix="$"
            label="Precio de venta"
            dense
            outlined
          />
          <q-input
            v-model.number="form.min_stock"
            class="col-12 col-sm-6 no-spin-input"
            type="number"
            min="0"
            :suffix="form.unit"
            label="Stock mínimo"
            dense
            outlined
          />
          <q-input
            v-if="!editingId"
            v-model.number="form.stock_qty"
            class="col-12 col-sm-6 no-spin-input"
            type="number"
            min="0"
            :suffix="form.unit"
            label="Stock inicial"
            dense
            outlined
          />
          <q-select
            v-if="!editingId && (form.stock_qty ?? 0) > 0"
            v-model="form.warehouse_id"
            :options="warehouseOptions"
            emit-value
            map-options
            class="col-12"
            label="Depósito del stock inicial"
            :hint="warehouseOptions.length ? '' : 'Creá un depósito primero'"
            :error="!form.warehouse_id"
            error-message="Elegí dónde entra el stock inicial"
            dense
            outlined
          />
          <div v-else class="col-12 col-sm-6">
            <div class="text-caption text-grey-7">Stock actual</div>
            <div class="text-weight-medium">{{ form.stock_qty }} {{ form.unit }}</div>
            <div class="text-caption text-grey-7">Se cambia desde Movimientos</div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Guardar" no-caps :loading="loading" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Barcode dialog -->
    <q-dialog v-model="barcodeOpen">
      <q-card style="width: 320px; max-width: 95vw" class="text-center">
        <q-card-section>
          <div class="text-h6">{{ barcodeProduct?.name }}</div>
        </q-card-section>
        <q-card-section>
          <BarcodeDisplay v-if="barcodeProduct" :value="barcodeProduct.sku" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete confirmation -->
    <q-dialog v-model="deleteConfirmOpen">
      <q-card style="width: 360px; max-width: 95vw">
        <q-card-section class="row items-center q-gutter-sm">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <div class="text-h6">Eliminar producto</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          ¿Seguro que querés eliminar <strong>{{ productToDelete?.name }}</strong>? Esta acción no se puede deshacer.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat color="negative" label="Eliminar" @click="deleteConfirmed" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Photo viewer / change -->
    <q-dialog v-model="photoViewerOpen">
      <q-card style="width: 360px; max-width: 95vw">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ photoViewerProduct?.name }}</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none text-center">
          <img
            v-if="photoViewerProduct?.image_url"
            :src="photoViewerProduct.image_url"
            style="max-width: 100%; max-height: 320px; border-radius: 8px"
          />
          <div v-else class="text-grey-6 q-pa-xl">
            <q-icon name="image" size="64px" />
            <div class="text-caption q-mt-sm">Sin foto todavía</div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            color="primary"
            icon="photo_camera"
            :label="photoViewerProduct?.image_url ? 'Cambiar foto' : 'Agregar foto'"
            no-caps
            @click="changePhoto"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Import result summary -->
    <q-dialog v-model="importResultOpen">
      <q-card style="width: 420px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">Resultado de la importación</div>
          <div class="text-caption text-grey-7">
            {{ importedCount }} producto(s) importado(s){{ importErrors.length ? `, ${importErrors.length} con error` : '' }}
          </div>
        </q-card-section>

        <q-card-section v-if="importErrors.length > 0" class="q-pt-none">
          <q-list bordered separator style="max-height: 240px; overflow-y: auto">
            <q-item v-for="(err, idx) in importErrors" :key="idx">
              <q-item-section>
                <q-item-label v-if="err.row > 0">Fila {{ err.row }}</q-item-label>
                <q-item-label caption>{{ err.message }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="printDialogOpen">
      <q-card style="width: 400px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">Imprimir rótulos</div>
        </q-card-section>

        <q-separator />

        <q-list separator>
          <q-item v-for="p in selected" :key="p.id">
            <q-item-section>
              <q-item-label>{{ p.name }}</q-item-label>
              <q-item-label caption>SKU: {{ p.sku }}</q-item-label>
            </q-item-section>
            <q-item-section side style="width: 90px">
              <q-input
                v-model.number="printQuantities[p.id]"
                type="number"
                dense
                outlined
                min="1"
                class="no-spin-input"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" icon="print" label="Imprimir" no-caps @click="printLabels" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Print-only label sheet: hidden on screen, shown via @media print -->
    <div id="label-print-area">
      <div v-for="item in printItems" :key="item.key" class="print-label">
        <div class="print-label__name">{{ item.product.name }}</div>
        <BarcodeDisplay :value="item.product.sku" :height="40" :bar-width="1.2" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue';
import type { QTableColumn } from 'quasar';
import { useProduct } from '@/composables/useProduct';
import { useCategory } from '@/composables/useCategory';
import { useSupplier } from '@/composables/useSupplier';
import { useWarehouse } from '@/composables/useWarehouse';
import type { Product } from '@/types/inventory';
import type { ProductParams, ImportRowError } from '@/services/products/productService';
import BarcodeDisplay from '@/components/BarcodeDisplay.vue';
import { pickProductImage } from '@/composables/useProductImage';

const {
  products,
  loading,
  loadProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  downloadImportTemplate,
  importProducts,
} =
  useProduct();
const { categories, loadCategories } = useCategory();
const { suppliers, loadSuppliers } = useSupplier();
const { warehouses, loadWarehouses } = useWarehouse();

const columns: QTableColumn[] = [
  { name: 'image', label: '', field: 'image_url', align: 'left' },
  { name: 'sku', label: 'SKU', field: 'sku', align: 'left', sortable: true },
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  { name: 'category', label: 'Categoría', field: 'category_id', align: 'left' },
  { name: 'supplier', label: 'Proveedor', field: 'supplier_id', align: 'left' },
  { name: 'unit', label: 'Unidad', field: 'unit', align: 'left' },
  { name: 'stock_qty', label: 'Stock', field: 'stock_qty', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'id', align: 'right' },
];

const categoryOptions = ref<{ label: string; value: string }[]>([]);
const supplierOptions = ref<{ label: string; value: string }[]>([]);
const warehouseOptions = ref<{ label: string; value: string }[]>([]);
watch(categories, (list) => {
  categoryOptions.value = list.map((c) => ({ label: c.name, value: c.id }));
});
watch(suppliers, (list) => {
  supplierOptions.value = list.map((s) => ({ label: s.name, value: s.id }));
});
watch(warehouses, (list) => {
  warehouseOptions.value = list.map((w) => ({ label: w.name, value: w.id }));
});

const search = ref('');
const categoryFilter = ref<string | null>(null);
const supplierFilter = ref<string | null>(null);
const lowStockOnly = ref(false);

function refreshList() {
  return loadProducts({
    category_id: categoryFilter.value || undefined,
    supplier_id: supplierFilter.value || undefined,
    search: search.value || undefined,
    low_stock: lowStockOnly.value || undefined,
  });
}

let searchTimeout: ReturnType<typeof setTimeout> | undefined;
watch(search, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => void refreshList(), 300);
});
watch([categoryFilter, supplierFilter, lowStockOnly], () => void refreshList());

onMounted(() => {
  void loadCategories();
  void loadSuppliers();
  void loadWarehouses();
  void refreshList();
});

function categoryName(id: string) {
  return categories.value.find((c) => c.id === id)?.name ?? '-';
}
function supplierName(id: string) {
  return suppliers.value.find((s) => s.id === id)?.name ?? '-';
}

function stockColor(product: Product) {
  if (product.stock_qty <= 0) return 'negative';
  if (product.stock_qty <= product.min_stock) return 'warning';
  return 'positive';
}

const dialogOpen = ref(false);
const editingId = ref<string | null>(null);
const form = reactive<ProductParams>({
  sku: '',
  name: '',
  category_id: '',
  supplier_id: '',
  unit: 'pieza',
  cost_price: 0,
  sale_price: 0,
  min_stock: 0,
  stock_qty: 0,
  warehouse_id: '',
  image_url: '',
});

function resetForm() {
  Object.assign(form, {
    sku: '',
    name: '',
    category_id: categoryOptions.value[0]?.value ?? '',
    supplier_id: supplierOptions.value[0]?.value ?? '',
    unit: 'pieza',
    cost_price: 0,
    sale_price: 0,
    min_stock: 0,
    stock_qty: 0,
    warehouse_id: warehouseOptions.value[0]?.value ?? '',
    image_url: '',
  });
}

function openCreate() {
  editingId.value = null;
  resetForm();
  dialogOpen.value = true;
}

async function pickFormImage() {
  const image = await pickProductImage();
  if (image) form.image_url = image;
}

function generateSku() {
  const categoryPart = (categoryOptions.value.find((c) => c.value === form.category_id)?.label ?? 'GEN')
    .slice(0, 3)
    .toUpperCase();
  const stopWords = new Set(['DE', 'DEL', 'LA', 'EL', 'LOS', 'LAS', 'Y', 'CON']);
  const namePart = form.name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .split('-')
    .filter((word) => word && !stopWords.has(word))
    .slice(0, 2)
    .join('-');
  const suffix = crypto.randomUUID().slice(0, 4).toUpperCase();
  form.sku = [categoryPart, namePart, suffix].filter(Boolean).join('-');
}

function openEdit(product: Product) {
  editingId.value = product.id;
  Object.assign(form, { ...product });
  dialogOpen.value = true;
}

async function save() {
  try {
    if (editingId.value) {
      const { sku, name, category_id, supplier_id, unit, cost_price, sale_price, min_stock, image_url } =
        form;
      await updateProduct(editingId.value, {
        sku,
        name,
        category_id,
        supplier_id,
        unit,
        cost_price,
        sale_price,
        min_stock,
        image_url,
      });
    } else {
      const stockQty = form.stock_qty ?? 0;
      if (stockQty > 0 && !form.warehouse_id) return; // the select already flags this
      await createProduct({ ...form, warehouse_id: stockQty > 0 ? (form.warehouse_id ?? '') : '' });
    }
    dialogOpen.value = false;
  } catch {
    // feedback already shown by the composable
  }
}

const barcodeOpen = ref(false);
const barcodeProduct = ref<Product | null>(null);

function openBarcode(product: Product) {
  barcodeProduct.value = product;
  barcodeOpen.value = true;
}

const deleteConfirmOpen = ref(false);
const productToDelete = ref<Product | null>(null);

function confirmDelete(product: Product) {
  productToDelete.value = product;
  deleteConfirmOpen.value = true;
}

async function deleteConfirmed() {
  if (productToDelete.value) await deleteProduct(productToDelete.value.id);
  productToDelete.value = null;
}

const photoViewerOpen = ref(false);
const photoViewerProduct = ref<Product | null>(null);

function openPhotoViewer(product: Product) {
  photoViewerProduct.value = product;
  photoViewerOpen.value = true;
}

async function changePhoto() {
  if (!photoViewerProduct.value) return;
  const image_url = await pickProductImage();
  if (!image_url) return;
  const { id, sku, name, category_id, supplier_id, unit, cost_price, sale_price, min_stock } =
    photoViewerProduct.value;
  await updateProduct(id, {
    sku,
    name,
    category_id,
    supplier_id,
    unit,
    cost_price,
    sale_price,
    min_stock,
    image_url,
  });
  photoViewerProduct.value = { ...photoViewerProduct.value, image_url };
}

const selected = ref<Product[]>([]);
const printDialogOpen = ref(false);
const printQuantities = reactive<Record<string, number>>({});

function openPrintDialog() {
  for (const p of selected.value) {
    if (!printQuantities[p.id]) printQuantities[p.id] = 1;
  }
  printDialogOpen.value = true;
}

const printItems = computed(() =>
  selected.value.flatMap((p) => {
    const qty = Math.max(1, printQuantities[p.id] ?? 1);
    return Array.from({ length: qty }, (_, i) => ({ key: `${p.id}-${i}`, product: p }));
  }),
);

async function printLabels() {
  await nextTick();
  const previousTitle = document.title;
  document.title = '';
  window.print();
  document.title = previousTitle;
}

const fileInputRef = ref<HTMLInputElement>();
const importResultOpen = ref(false);
const importedCount = ref(0);
const importErrors = ref<ImportRowError[]>([]);

function triggerImport() {
  fileInputRef.value?.click();
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;

  try {
    const result = await importProducts(file);
    importedCount.value = result.imported;
    importErrors.value = result.errors ?? [];
    importResultOpen.value = true;
    await refreshList();
  } catch {
    // feedback already shown by the composable
  }
}
</script>

<style scoped lang="scss">
.hidden {
  display: none;
}

.product-thumb :deep(img) {
  object-fit: cover;
}

.no-spin-input :deep(input[type='number']) {
  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
}

#label-print-area {
  display: none;
}

@media print {
  @page {
    margin: 12mm;
  }

  :global(body *) {
    visibility: hidden;
  }

  #label-print-area,
  #label-print-area * {
    visibility: visible;
  }

  #label-print-area {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 32px;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }

  .print-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 22px 16px;
    border: 1px solid #333;
    border-radius: 6px;
    text-align: center;
    overflow: hidden;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .print-label__name {
    font-size: 13px;
    font-weight: 600;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  .print-label svg {
    max-width: 100%;
    height: auto;
  }
}
</style>
