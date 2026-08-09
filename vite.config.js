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
        novel: resolve(__dirname, 'src/novel.html'),
        gacha: resolve(__dirname, 'src/gacha.html'),
        gallery: resolve(__dirname, 'src/gallery.html')
      }
    }
  },
  server: {
    open: '/index.html'
  }
});
