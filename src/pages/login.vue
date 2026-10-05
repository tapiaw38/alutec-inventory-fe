<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center bg-grey-2">
        <q-card flat bordered style="width: 360px; max-width: 92vw">
          <q-card-section class="text-center q-pb-none">
            <q-icon name="inventory_2" size="40px" color="primary" />
            <div class="text-h6 q-mt-sm">Alutec Inventario</div>
            <div class="text-caption text-grey-7">Ingresá para continuar</div>
          </q-card-section>

          <q-form @submit="submit">
            <q-card-section class="q-gutter-md">
              <q-input
                v-model="form.email"
                type="email"
                label="Email"
                dense
                outlined
                autofocus
                autocomplete="username"
                :rules="[(v) => !!v || 'Ingresá tu email']"
              >
                <template #prepend><q-icon name="mail" /></template>
              </q-input>

              <q-input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                label="Contraseña"
                dense
                outlined
                autocomplete="current-password"
                :rules="[(v) => !!v || 'Ingresá tu contraseña']"
              >
                <template #prepend><q-icon name="lock" /></template>
                <template #append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>
            </q-card-section>

            <q-card-actions class="q-px-md q-pb-md">
              <q-btn
                type="submit"
                color="primary"
                class="full-width"
                label="Ingresar"
                no-caps
                :loading="loading"
              />
            </q-card-actions>
          </q-form>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const route = useRoute();
const { login, loading } = useAuth();

const showPassword = ref(false);
const form = reactive({ email: '', password: '' });

async function submit() {
  try {
    await login({ ...form });
    // Return to whatever the guard interrupted, defaulting to the dashboard.
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
    await router.replace(redirect);
  } catch {
    // feedback already shown by the composable
  }
}
</script>
