import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      // Fix for URI malformed error
      protocol: 'ws',
      host: 'localhost',
      overlay: false // Disable the error overlay
    },
    watch: {
      // Avoid watching large directories
      ignored: ['**/node_modules/**', '**/dist/**'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    // Ensure Vite properly handles environment variables
    sourcemap: false,
    // Fix for crypto issues
    rollupOptions: {
      // Avoid circular dependencies
      onwarn(warning, warn) {
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        warn(warning);
      },
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'map-vendor': ['leaflet', 'maplibre-gl', 'react-leaflet'],
          'globe-vendor': ['react-globe.gl', 'three']
        }
      }
    }
  },
  optimizeDeps: {
    // Pre-bundle these dependencies
    include: ['react', 'react-dom', 'react-router-dom'],
  }
});
