<template>
  <q-page padding>
    <div class="row items-center q-mb-md">
      <div class="text-h5">Categorías</div>
      <q-space />
      <q-btn dense color="primary" icon="add" label="Nueva" no-caps @click="openCreate" />
    </div>

    <q-table flat bordered :rows="categories" :columns="columns" row-key="id" :loading="loading">
      <template #body-cell-type="props">
        <q-td :props="props">
          <q-badge :color="props.value === 'raw_material' ? 'secondary' : 'accent'">
            {{ typeLabel(props.value) }}
          </q-badge>
        </q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props" class="text-right">
          <q-btn flat dense round icon="edit" @click="openEdit(props.row)" />
          <q-btn flat dense round icon="delete" color="negative" @click="confirmDelete(props.row)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialogOpen">
      <q-card style="width: 350px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">{{ editingId ? 'Editar categoría' : 'Nueva categoría' }}</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model="form.name" label="Nombre" dense outlined autofocus />
          <q-select
            v-model="form.type"
            :options="typeOptions"
            emit-value
            map-options
            label="Tipo"
            dense
            outlined
          />
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
          <div class="text-h6">Eliminar categoría</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          ¿Seguro que querés eliminar <strong>{{ categoryToDelete?.name }}</strong>?
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
import { useCategory } from '@/composables/useCategory';
import type { Category, CategoryType } from '@/types/inventory';
import type { CategoryParams } from '@/services/categories/categoryService';

const { categories, loading, loadCategories, createCategory, updateCategory, deleteCategory } =
  useCategory();

onMounted(loadCategories);

const columns: QTableColumn[] = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  { name: 'type', label: 'Tipo', field: 'type', align: 'left' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
];

const typeOptions: { label: string; value: CategoryType }[] = [
  { label: 'Materia prima', value: 'raw_material' },
  { label: 'Producto terminado', value: 'finished_good' },
];

function typeLabel(type: CategoryType) {
  return typeOptions.find((o) => o.value === type)?.label ?? type;
}

const dialogOpen = ref(false);
const editingId = ref<string | null>(null);
const form = reactive<CategoryParams>({ name: '', type: 'raw_material' });

function openCreate() {
  editingId.value = null;
  form.name = '';
  form.type = 'raw_material';
  dialogOpen.value = true;
}

function openEdit(category: Category) {
  editingId.value = category.id;
  form.name = category.name;
  form.type = category.type;
  dialogOpen.value = true;
}

async function save() {
  try {
    if (editingId.value) {
      await updateCategory(editingId.value, { ...form });
    } else {
      await createCategory({ ...form });
    }
    dialogOpen.value = false;
  } catch {
    // feedback already shown by the composable
  }
}

const deleteConfirmOpen = ref(false);
const categoryToDelete = ref<Category | null>(null);

function confirmDelete(category: Category) {
  categoryToDelete.value = category;
  deleteConfirmOpen.value = true;
}

async function deleteConfirmed() {
  if (categoryToDelete.value) await deleteCategory(categoryToDelete.value.id);
  categoryToDelete.value = null;
}
</script>
