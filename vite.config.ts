import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production';
  const isGitHubPages = process.env.GITHUB_PAGES === 'true';

  return {
    plugins: [react()],
    
    // Base URL for GitHub Pages deployment
    base: isGitHubPages ? '/weather-comparison-app/' : '/',
    
    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: !isProduction,
      minify: isProduction ? 'esbuild' : false,
      
      // Optimize bundle
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunk for React and related libraries
            vendor: ['react', 'react-dom'],
            
            // Charts chunk for Recharts
            charts: ['recharts'],
            
            // Utils chunk for utility libraries
            utils: ['date-fns', 'clsx'],
          },
        },
      },
      
      // Asset optimization
      assetsInlineLimit: 4096, // 4kb
      cssCodeSplit: true,
      
      // Build performance
      target: 'es2015',
      reportCompressedSize: false,
    },
    
    // Development server configuration
    server: {
      port: 3000,
      open: true,
      cors: true,
    },
    
    // Preview server configuration
    preview: {
      port: 4173,
      open: true,
    },
    
    // Path resolution
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@services': resolve(__dirname, 'src/services'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@types': resolve(__dirname, 'src/types'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@context': resolve(__dirname, 'src/context'),
      },
    },
    
    // Environment variables
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    
    // CSS configuration
    css: {
      devSourcemap: !isProduction,
      postcss: {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
          ...(isProduction ? [require('cssnano')] : []),
        ],
      },
    },
    
    // Optimization
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'recharts',
        'date-fns',
        'clsx',
      ],
    },
    
    // Test configuration
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/__tests__/setup.ts'],
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/__tests__/',
          '**/*.d.ts',
          '**/*.config.*',
          'dist/',
        ],
      },
    },
  };
});