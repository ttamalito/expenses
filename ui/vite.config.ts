import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false, // true to open the report in the browser
    }),
  ],
  resolve: {
    alias: {
      // /esm/icons/index.mjs only exports the icons statically, so no separate chunks are created
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
      '@clients': path.resolve(__dirname, './src/models/clients.ts'),
      '@routes': path.resolve(__dirname, './src/routes/routes.ts'),
      '@apiRoutes': path.resolve(__dirname, './src/routes/apiRoutes.ts'),
      '@requests': path.resolve(__dirname, './src/hooks/requests'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            const chunks = id.split('node_modules/');
            return chunks[chunks.length - 1].split('/')[0];
          }
          return;
        },
      },
    },
  },
  server: {
    // https: {
    //   key: '/Users/jjgon/Documents/https_certs/key.pem', //uncomment to use http2 and https
    //   cert: '/Users/jjgon/Documents/https_certs/cert.pem',
    // },
    port: 3000,
    open: '/',
  },
});
// bundle size optimization see:
// https://sambitsahoo.com/blog/vite-code-splitting-that-works.html
// https://dev.to/tassiofront/splitting-vendor-chunk-with-vite-and-loading-them-async-15o3
