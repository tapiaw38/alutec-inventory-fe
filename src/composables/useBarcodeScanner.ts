import { Capacitor } from '@capacitor/core';
import { BarcodeFormat, BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';

export class ScannerUnavailableError extends Error {}
export class ScannerPermissionDeniedError extends Error {}

export async function scanBarcode(): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) {
    throw new ScannerUnavailableError('Escaneo solo disponible en la app compilada (Android/iOS).');
  }

  const { camera } = await BarcodeScanner.requestPermissions();
  if (camera !== 'granted' && camera !== 'limited') {
    throw new ScannerPermissionDeniedError('Permiso de cámara denegado.');
  }

  const { available } = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
  if (!available) {
    await BarcodeScanner.installGoogleBarcodeScannerModule();
  }

  const { barcodes } = await BarcodeScanner.scan({
    formats: [BarcodeFormat.Code128],
  });

  return barcodes[0]?.rawValue ?? null;
}
