import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

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
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    // Improve sourcemap generation
    sourcemap: true,
    rollupOptions: {
      // Avoid circular dependencies
      onwarn(warning, warn) {
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        warn(warning);
      }
    }
  },
  optimizeDeps: {
    // Pre-bundle these dependencies
    include: ['react', 'react-dom', 'react-router-dom'],
  }
});
