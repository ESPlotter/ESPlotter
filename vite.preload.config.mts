import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '.vite/build',
    emptyOutDir: false,
    lib: {
      entry: 'src/app/preload/preload.ts',
      formats: ['cjs'],
      fileName: () => 'preload',
    },
    rollupOptions: {
      external: ['electron'],
      output: {
        entryFileNames: 'preload.js',
      },
    },
    target: 'node18',
    sourcemap: true,
  },
});
