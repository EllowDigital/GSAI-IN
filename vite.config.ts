import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Validate required environment variables in production build
  if (mode === 'production') {
    const requiredEnvVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY',
      'VITE_SUPABASE_PROJECT_ID'
    ];
    
    const missingVars = requiredEnvVars.filter(key => !env[key]);
    if (missingVars.length > 0) {
      console.error('\n❌ ERROR: Missing required environment variables:');
      missingVars.forEach(key => console.error(`   - ${key}`));
      console.error('\nPlease set these in Netlify Dashboard > Site settings > Environment variables\n');
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }
  }
  
  return {
    server: {
      host: "::",
      port: 8080,
      strictPort: true,
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
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
    },
    define: {
      // Ensure environment variables are available
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'import.meta.env.VITE_SUPABASE_PROJECT_ID': JSON.stringify(env.VITE_SUPABASE_PROJECT_ID),
    },
  };
});
