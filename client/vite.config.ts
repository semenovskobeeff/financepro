import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      app: path.resolve(__dirname, './src/app'),
      entities: path.resolve(__dirname, './src/entities'),
      features: path.resolve(__dirname, './src/features'),
      pages: path.resolve(__dirname, './src/pages'),
      processes: path.resolve(__dirname, './src/processes'),
      shared: path.resolve(__dirname, './src/shared'),
      widgets: path.resolve(__dirname, './src/widgets'),
    },
  },
  server: {
    port: parseInt(process.env.CLIENT_PORT) || 5175,
    host: true,
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.SERVER_PORT || 3001}`,
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      port: parseInt(process.env.HMR_PORT) || 5176,
    },
    open: false,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          router: ['react-router-dom'],
        },
      },
    },
  },
});
