import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

import aliasConfig from './tsconfig.paths.json' with { type: 'json' };

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const appPathAlias = Object.fromEntries(
  Object.entries(aliasConfig.compilerOptions.paths).map(([key, values]) => {
    const aliasKey = key.replace(/\/\*$/, '');
    const aliasPath = values[0].replace(/\/\*$/, '');
    return [aliasKey, resolve(projectRoot, aliasPath)];
  }),
);

export default defineConfig({
  resolve: {
    alias: appPathAlias,
  },
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
