<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5">Proveedores</div>
      <q-space />
      <q-btn dense color="primary" icon="add" label="Nuevo" no-caps @click="openCreate" />
    </div>

    <q-table flat bordered :rows="suppliers" :columns="columns" row-key="id" :loading="loading">
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
          <div class="text-h6">{{ editingId ? 'Editar proveedor' : 'Nuevo proveedor' }}</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model="form.name" label="Nombre" dense outlined autofocus />
          <q-input v-model="form.phone" label="Teléfono" dense outlined />
          <q-input v-model="form.email" label="Email" type="email" dense outlined />
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
          <div class="text-h6">Eliminar proveedor</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          ¿Seguro que querés eliminar <strong>{{ supplierToDelete?.name }}</strong>?
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
import { useSupplier } from '@/composables/useSupplier';
import type { Supplier } from '@/types/inventory';
import type { SupplierParams } from '@/services/suppliers/supplierService';

const { suppliers, loading, loadSuppliers, createSupplier, updateSupplier, deleteSupplier } =
  useSupplier();

onMounted(loadSuppliers);

const columns: QTableColumn[] = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  { name: 'phone', label: 'Teléfono', field: 'phone', align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
];

const dialogOpen = ref(false);
const editingId = ref<string | null>(null);
const form = reactive<SupplierParams>({ name: '', phone: '', email: '' });

function openCreate() {
  editingId.value = null;
  form.name = '';
  form.phone = '';
  form.email = '';
  dialogOpen.value = true;
}

function openEdit(supplier: Supplier) {
  editingId.value = supplier.id;
  form.name = supplier.name;
  form.phone = supplier.phone;
  form.email = supplier.email;
  dialogOpen.value = true;
}

async function save() {
  try {
    if (editingId.value) {
      await updateSupplier(editingId.value, { ...form });
    } else {
      await createSupplier({ ...form });
    }
    dialogOpen.value = false;
  } catch {
    // feedback already shown by the composable
  }
}

const deleteConfirmOpen = ref(false);
const supplierToDelete = ref<Supplier | null>(null);

function confirmDelete(supplier: Supplier) {
  supplierToDelete.value = supplier;
  deleteConfirmOpen.value = true;
}

async function deleteConfirmed() {
  if (supplierToDelete.value) await deleteSupplier(supplierToDelete.value.id);
  supplierToDelete.value = null;
}
</script>
