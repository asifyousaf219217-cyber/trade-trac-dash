import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 8080
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        markets: resolve(__dirname, 'markets.html'),
        currencies: resolve(__dirname, 'currencies.html'),
        trends: resolve(__dirname, 'trends.html'),
        news: resolve(__dirname, 'news.html'),
        about: resolve(__dirname, 'about.html'),
      },
    },
  },
});
