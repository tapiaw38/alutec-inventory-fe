import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

/**
 * Native (Android/iOS): shows the OS action sheet to choose Camera or Gallery.
 * Web: falls back to a plain file input (CameraSource.Photos skips Capacitor's
 * web "Prompt" action sheet, which requires @ionic/pwa-elements to render).
 */
export async function pickProductImage(): Promise<string | null> {
  try {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: Capacitor.isNativePlatform() ? CameraSource.Prompt : CameraSource.Photos,
      quality: 70,
    });
    return photo.dataUrl ?? null;
  } catch {
    return null; // user cancelled
  }
}
