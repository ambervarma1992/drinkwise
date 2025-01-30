/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/drinkwise/',
  server: {
    host: 'localhost',
    port: 5173
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
}); 