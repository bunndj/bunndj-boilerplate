import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command }) => ({
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.tsx'],
      refresh: true,
    }),
    react({
      jsxRuntime: 'automatic',
    }),
    tailwindcss(),
  ],
  // Development-only server configuration
  ...(command === 'serve' && {
    server: {
      host: '0.0.0.0',
      port: 5173,
      hmr: {
        host: 'localhost',
      },
      cors: true,
    },
  }),
  resolve: {
    alias: {
      '@': '/resources/js',
    },
  },
}));
