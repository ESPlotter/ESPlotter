import { builtinModules } from 'node:module';
import { defineConfig } from 'vite';

const nodeBuiltins = [
  ...new Set([...builtinModules, ...builtinModules.map((moduleName) => `node:${moduleName}`)]),
];

export default defineConfig({
  build: {
    outDir: '.vite/build',
    emptyOutDir: false,
    lib: {
      entry: 'src/app/main/main.ts',
      formats: ['es'],
      fileName: () => 'main',
    },
    rollupOptions: {
      external: ['electron', 'electron-squirrel-startup', ...nodeBuiltins],
      output: {
        entryFileNames: 'main.mjs',
      },
    },
    target: 'node18',
    sourcemap: true,
  },
});
