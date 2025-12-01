import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.delyra.app',
  appName: 'Delyra',
  // APUNTANDO A LA SUBCARPETA DE SALIDA DE ANGULAR (builder genera carpeta `browser`)
  webDir: 'dist/FrontendDelyra/browser',
};

export default config;
