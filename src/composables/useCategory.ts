import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { inventoryApi } from '@/api/request/server';
import { CategoryService, type CategoryParams } from '@/services/categories/categoryService';
import { useCategoryStore } from '@/stores/categoryStore';

export const useCategory = () => {
  const $q = useQuasar();
  const service = new CategoryService(inventoryApi);
  const store = useCategoryStore(service)();
  const { categories, loading } = storeToRefs(store);

  const loadCategories = async () => {
    try {
      return await store.fetchCategories();
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudieron cargar las categorías' });
      throw new Error('load-categories-failed');
    }
  };

  const createCategory = async (params: CategoryParams) => {
    try {
      const category = await store.createCategory(params);
      $q.notify({ type: 'positive', message: 'Categoría creada correctamente' });
      return category;
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudo crear la categoría' });
      throw new Error('create-category-failed');
    }
  };

  const updateCategory = async (id: string, params: CategoryParams) => {
    try {
      const category = await store.updateCategory(id, params);
      $q.notify({ type: 'positive', message: 'Categoría actualizada correctamente' });
      return category;
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudo actualizar la categoría' });
      throw new Error('update-category-failed');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await store.deleteCategory(id);
      $q.notify({ type: 'positive', message: 'Categoría eliminada correctamente' });
    } catch {
      $q.notify({ type: 'negative', message: 'No se pudo eliminar la categoría' });
      throw new Error('delete-category-failed');
    }
  };

  return {
    categories,
    loading,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
