<template>
  <svg ref="svgRef" class="barcode"></svg>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import JsBarcode from 'jsbarcode';
import { fittedBarWidth } from '@/utils/barcode';

const props = withDefaults(
  defineProps<{ value: string; height?: number; barWidth?: number; maxWidth?: number }>(),
  {
    height: 50,
    barWidth: 1.6,
    maxWidth: 280,
  },
);

const svgRef = ref<SVGSVGElement>();

function render() {
  if (!svgRef.value || !props.value) return;
  JsBarcode(svgRef.value, props.value, {
    format: 'CODE128',
    displayValue: true,
    height: props.height,
    width: fittedBarWidth(props.value, props.barWidth, props.maxWidth),
    margin: 8,
  });
}

onMounted(render);
watch(() => [props.value, props.height, props.barWidth, props.maxWidth], render);
</script>

<style scoped>
/* Keeps the symbol inside narrow cards and label cells instead of overflowing. */
.barcode {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
}
</style>
