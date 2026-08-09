import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  base: './',
  publicDir: 'public',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/index.html'),
        menu: resolve(__dirname, 'src/menu.html'),
        novel: resolve(__dirname, 'src/novel.html'),
        gacha: resolve(__dirname, 'src/gacha.html')
      }
    }
  },
  server: {
    open: '/menu.html'
  }
});
