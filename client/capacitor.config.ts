import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.calendar.app',
  appName: 'Calendar',
  webDir: 'dist',
  server: {
    url: 'https://calendar-3aig.onrender.com',
    androidScheme: 'https',
  },
};

export default config;
