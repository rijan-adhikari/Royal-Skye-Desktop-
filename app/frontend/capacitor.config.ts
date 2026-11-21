import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.royalskye.restaurant',
  appName: 'Royal Skye',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: { androidScheme: 'https' },
};
export default config;
