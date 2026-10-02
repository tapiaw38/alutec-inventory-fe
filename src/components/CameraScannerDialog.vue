<template>
  <q-dialog :model-value="modelValue" @update:model-value="(v) => emit('update:modelValue', v)" @hide="stop">
    <q-card style="width: 420px; max-width: 95vw">
      <q-card-section class="row items-center">
        <div class="text-h6">Escanear código</div>
        <q-space />
        <q-btn flat round dense icon="close" v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="scanner-viewport">
          <video ref="videoRef" autoplay playsinline muted class="scanner-video" />
          <div class="scanner-frame">
            <span class="corner corner--tl" />
            <span class="corner corner--tr" />
            <span class="corner corner--bl" />
            <span class="corner corner--br" />
          </div>
        </div>
        <div class="text-caption q-mt-sm" :class="error ? 'text-negative' : 'text-grey-7'">
          {{ error || 'Apuntá la cámara al código de barras.' }}
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';
import type { IScannerControls } from '@zxing/browser';

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [boolean]; detected: [string] }>();

const videoRef = ref<HTMLVideoElement>();
const error = ref('');

let stream: MediaStream | null = null;
let rafId: number | null = null;
let zxingControls: IScannerControls | null = null;

function emitDetected(value: string) {
  emit('detected', value);
  emit('update:modelValue', false);
}

async function start() {
  error.value = '';

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        advanced: [{ focusMode: 'continuous' } as unknown as MediaTrackConstraintSet],
      },
    });
  } catch (err) {
    console.warn('[scanner] getUserMedia error', err);
    error.value = 'No se pudo acceder a la cámara. Revisá los permisos del navegador.';
    return;
  }

  const video = videoRef.value;
  if (!video) return;
  video.srcObject = stream;
  await video.play();
  console.log('[scanner] video ready', video.videoWidth, video.videoHeight);
  console.log('[scanner] track settings', stream.getVideoTracks()[0]?.getSettings());

  const BarcodeDetectorCtor = (window as unknown as { BarcodeDetector?: new (opts: { formats: string[] }) => {
    detect: (source: HTMLVideoElement) => Promise<{ rawValue: string; format: string }[]>;
  } }).BarcodeDetector;

  console.log('[scanner] using', BarcodeDetectorCtor ? 'BarcodeDetector' : 'zxing');

  if (BarcodeDetectorCtor) {
    const detector = new BarcodeDetectorCtor({ formats: ['code_128'] });
    let frame = 0;
    const tick = async () => {
      if (!videoRef.value) return;
      try {
        const codes = await detector.detect(videoRef.value);
        if (frame++ % 30 === 0) console.log('[scanner] frame', frame, 'codes found', codes.length);
        if (codes.length > 0 && codes[0]) {
          console.log('[scanner] detected', codes[0].format, codes[0].rawValue);
          emitDetected(codes[0].rawValue);
          return;
        }
      } catch (err) {
        console.warn('[scanner] detect error', err);
      }
      rafId = requestAnimationFrame(() => void tick());
    };
    rafId = requestAnimationFrame(() => void tick());
    return;
  }

  const { BrowserMultiFormatReader, BarcodeFormat } = await import('@zxing/browser');
  const reader = new BrowserMultiFormatReader();
  reader.possibleFormats = [
    BarcodeFormat.CODE_128,
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.CODE_39,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
  ];
  let attempts = 0;
  zxingControls = await reader.decodeFromStream(stream, video, (result, err) => {
    if (result) {
      console.log('[scanner] detected', result.getBarcodeFormat(), result.getText());
      emitDetected(result.getText());
      return;
    }
    attempts++;
    if (attempts % 20 === 0) console.log('[scanner] still scanning, attempts:', attempts);
    if (err && err.name !== 'NotFoundException') {
      console.warn('[scanner] decode error', err.name, err.message);
    }
  });
}

function stop() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  zxingControls?.stop();
  zxingControls = null;
  stream?.getTracks().forEach((track) => track.stop());
  stream = null;
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) void start();
    else stop();
  },
);

onBeforeUnmount(stop);
</script>

<style scoped lang="scss">
.scanner-viewport {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.scanner-video {
  width: 100%;
  display: block;
  background: #000;
}

.scanner-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 82%;
  aspect-ratio: 2.8 / 1;
  transform: translate(-50%, -50%);
  border-radius: 12px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}

.corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border: 3px solid #fff;
}

.corner--tl {
  top: -3px;
  left: -3px;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 8px;
}

.corner--tr {
  top: -3px;
  right: -3px;
  border-left: none;
  border-bottom: none;
  border-top-right-radius: 8px;
}

.corner--bl {
  bottom: -3px;
  left: -3px;
  border-right: none;
  border-top: none;
  border-bottom-left-radius: 8px;
}

.corner--br {
  bottom: -3px;
  right: -3px;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 8px;
}
</style>
