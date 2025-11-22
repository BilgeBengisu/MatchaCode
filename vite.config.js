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
    minify: 'esbuild', // Use esbuild (default, faster, no extra dependency instead of terser)
    target: 'es2022' // Support top-level await
  },
  
  // esbuild configuration for transpilation
  esbuild: {
    target: 'es2022' // Support top-level await in esbuild
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['@supabase/supabase-js']
  }
});