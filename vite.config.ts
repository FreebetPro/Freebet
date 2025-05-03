import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '7794-2804-14d-7890-88da-2470-6e26-8e84-7acd.ngrok-free.app',
      '5b15-2a02-4780-14-f5d-00-1.ngrok-free.app'
    ]
  }
});