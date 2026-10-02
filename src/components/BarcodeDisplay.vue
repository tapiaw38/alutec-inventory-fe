<template>
  <svg ref="svgRef"></svg>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import JsBarcode from 'jsbarcode';

const props = withDefaults(defineProps<{ value: string; height?: number; barWidth?: number }>(), {
  height: 50,
  barWidth: 1.6,
});

const svgRef = ref<SVGSVGElement>();

function render() {
  if (!svgRef.value || !props.value) return;
  JsBarcode(svgRef.value, props.value, {
    format: 'CODE128',
    displayValue: true,
    height: props.height,
    width: props.barWidth,
    margin: 8,
  });
}

onMounted(render);
watch(() => props.value, render);
</script>
