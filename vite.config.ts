import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import componentTagger from 'lovable-tagger/vite';

export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
  },
  plugins: [
    react(),

    // Lovable Tagger works only in development mode
    mode === 'development' && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  esbuild: {
    legalComments: 'none',
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'recharts',
      'framer-motion',
    ],
    esbuildOptions: {
      target: 'es2020',
    },
  },

  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
    modulePreload: { polyfill: false },
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1500,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendors';
            if (id.includes('@tanstack')) return 'tanstack';
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('framer-motion')) return 'framer-motion';
            if (id.includes('recharts')) return 'recharts';
            if (id.includes('@radix-ui')) return 'radix';
          }

          if (id.includes(`${path.resolve(__dirname, 'src/pages/admin')}`)) {
            return 'admin-pages';
          }

          if (id.includes(`${path.resolve(__dirname, 'src/pages')}`)) {
            return 'pages';
          }
        },
      },
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
}));
