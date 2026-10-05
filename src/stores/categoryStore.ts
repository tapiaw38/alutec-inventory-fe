import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ICategoryService, CategoryParams } from '@/services/categories/categoryService';
import type { Category } from '@/types/inventory';

export const useCategoryStore = (service: ICategoryService) =>
  defineStore('categories', () => {
    const categories = ref<Category[]>([]);
    const loading = ref(false);

    const fetchCategories = async () => {
      loading.value = true;
      try {
        const response = await service.list();
        categories.value = response.data || [];
        return categories.value;
      } finally {
        loading.value = false;
      }
    };

    const createCategory = async (params: CategoryParams) => {
      loading.value = true;
      try {
        const response = await service.create(params);
        categories.value.push(response.data);
        return response.data;
      } finally {
        loading.value = false;
      }
    };

    const updateCategory = async (id: string, params: CategoryParams) => {
      loading.value = true;
      try {
        const response = await service.update(id, params);
        const index = categories.value.findIndex((c) => c.id === id);
        if (index !== -1) categories.value[index] = response.data;
        return response.data;
      } finally {
        loading.value = false;
      }
    };

    const deleteCategory = async (id: string) => {
      loading.value = true;
      try {
        const result = await service.delete(id);
        categories.value = categories.value.filter((c) => c.id !== id);
        return result;
      } finally {
        loading.value = false;
      }
    };

    return {
      categories,
      loading,
      fetchCategories,
      createCategory,
      updateCategory,
      deleteCategory,
    };
  });
