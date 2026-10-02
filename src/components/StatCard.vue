<template>
  <q-card flat bordered class="stat-card" :class="`stat-card--${color}`">
    <q-card-section class="column items-center text-center q-pa-xs">
      <q-avatar :color="color" text-color="white" :icon="icon" size="26px" />
      <div class="text-h4 text-weight-bold q-mt-xs">{{ value }}</div>
      <div class="text-caption text-grey-7 stat-card__label">{{ label }}</div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  label: string;
  value: number | string;
  color: string;
}>();
</script>

<style scoped lang="scss">
.stat-card {
  border-block-start-width: 4px;
  border-block-start-style: solid;
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-2px);
  }
}

.stat-card__label {
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 11px;
}

.stat-card--primary {
  border-block-start-color: var(--q-primary);
}
.stat-card--secondary {
  border-block-start-color: var(--q-secondary);
}
.stat-card--accent {
  border-block-start-color: var(--q-accent);
}
.stat-card--negative {
  border-block-start-color: var(--q-negative);
}
.stat-card--positive {
  border-block-start-color: var(--q-positive);
}
</style>
