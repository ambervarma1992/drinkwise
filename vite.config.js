/// <reference types="vite/client" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        strictPort: true,
        host: '127.0.0.1',
        open: true
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
});
