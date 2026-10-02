<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5">Depósitos</div>
      <q-space />
      <q-btn dense color="primary" icon="add" label="Nuevo" no-caps @click="openCreate" />
    </div>

    <q-table flat bordered :rows="warehouses" :columns="columns" row-key="id" :loading="loading">
      <template #body-cell-actions="props">
        <q-td :props="props" class="text-right">
          <q-btn flat dense round icon="edit" @click="openEdit(props.row)" />
          <q-btn flat dense round icon="delete" color="negative" @click="confirmDelete(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialogOpen">
      <q-card style="width: 380px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">{{ editingId ? 'Editar depósito' : 'Nuevo depósito' }}</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model="form.name" label="Nombre" dense outlined autofocus />
          <q-input v-model="form.location" label="Dirección" dense outlined />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Guardar" no-caps :loading="loading" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteConfirmOpen">
      <q-card style="width: 360px; max-width: 95vw">
        <q-card-section class="row items-center q-gutter-sm">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <div class="text-h6">Eliminar depósito</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          ¿Seguro que querés eliminar <strong>{{ warehouseToDelete?.name }}</strong>?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat color="negative" label="Eliminar" @click="deleteConfirmed" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { QTableColumn } from 'quasar';
import { useWarehouse } from '@/composables/useWarehouse';
import type { Warehouse } from '@/types/inventory';
import type { WarehouseParams } from '@/services/warehouses/warehouseService';

const { warehouses, loading, loadWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } =
  useWarehouse();

onMounted(loadWarehouses);

const columns: QTableColumn[] = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  { name: 'location', label: 'Dirección', field: 'location', align: 'left' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
];

const dialogOpen = ref(false);
const editingId = ref<string | null>(null);
const form = reactive<WarehouseParams>({ name: '', location: '' });

function openCreate() {
  editingId.value = null;
  form.name = '';
  form.location = '';
  dialogOpen.value = true;
}

function openEdit(warehouse: Warehouse) {
  editingId.value = warehouse.id;
  form.name = warehouse.name;
  form.location = warehouse.location;
  dialogOpen.value = true;
}

async function save() {
  try {
    if (editingId.value) {
      await updateWarehouse(editingId.value, { ...form });
    } else {
      await createWarehouse({ ...form });
    }
    dialogOpen.value = false;
  } catch {
    // feedback already shown by the composable
  }
}

const deleteConfirmOpen = ref(false);
const warehouseToDelete = ref<Warehouse | null>(null);

function confirmDelete(warehouse: Warehouse) {
  warehouseToDelete.value = warehouse;
  deleteConfirmOpen.value = true;
}

async function deleteConfirmed() {
  if (warehouseToDelete.value) await deleteWarehouse(warehouseToDelete.value.id);
  warehouseToDelete.value = null;
}
</script>
