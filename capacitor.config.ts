import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myzymo.app',
  appName: 'Myzymo',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https',
    // Allow local network access for development
    allowNavigation: ['*']
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FF6B35',
      showSpinner: false
    }
  }
};

export default config;
