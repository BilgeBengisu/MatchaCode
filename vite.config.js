// Vite configuration for MatchaCode
import { defineConfig } from 'vite';

export default defineConfig({
  // Base path for the application
  base: '/',
  
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    host: true
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser'
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: []
  }
});