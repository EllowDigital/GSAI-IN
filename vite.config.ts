import { defineConfig } from 'vitest/config';
import type { PluginOption, UserConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(async ({ mode }): Promise<UserConfig> => {
  const plugins: PluginOption[] = [react()];
  const isLovableDev = mode === 'development' && process.env.LOVABLE_DEV_SERVER === 'true';

  if (isLovableDev) {
    try {
      const taggerModule = await import('lovable-tagger');
      const { componentTagger, default: defaultExport } = taggerModule as {
        componentTagger?: () => PluginOption | PluginOption[];
        default?: () => PluginOption | PluginOption[];
      };

      const taggerFactory = componentTagger ?? defaultExport;

      if (typeof taggerFactory === 'function') {
        const plugin = taggerFactory();

        if (Array.isArray(plugin)) {
          plugins.push(...plugin);
        } else if (plugin) {
          plugins.push(plugin);
        }
      } else {
        console.warn('lovable-tagger loaded but no plugin factory was found.');
      }
    } catch (error) {
      console.warn('lovable-tagger not available, continuing without it:', error);
    }
  }

  const config: UserConfig = {
    server: {
      host: '::',
      port: 5173,
      strictPort: true,
    },

    plugins,

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
      // IMPORTANT: manualChunks removed to prevent production errors
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
  };

  return config;
});
