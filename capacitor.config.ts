import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.targetclasses.app',
  appName: 'Target Classes',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
