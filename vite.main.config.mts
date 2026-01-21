import { builtinModules } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';

import aliasConfig from './tsconfig.paths.json' with { type: 'json' };

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const appPathAlias = Object.fromEntries(
  Object.entries(aliasConfig.compilerOptions.paths).map(([key, values]) => {
    const aliasKey = key.replace(/\/\*$/, '');
    const aliasPath = values[0].replace(/\/\*$/, '');
    return [aliasKey, resolve(projectRoot, aliasPath)];
  }),
);

const nodeBuiltins = [
  ...new Set([...builtinModules, ...builtinModules.map((moduleName) => `node:${moduleName}`)]),
];

export default defineConfig({
  resolve: {
    alias: appPathAlias,
    conditions: ['node'],
  },
  build: {
    outDir: '.vite/build',
    emptyOutDir: false,
    lib: {
      entry: 'src/app/main/main.ts',
      formats: ['es'],
      fileName: () => 'main',
    },
    rollupOptions: {
      external: (id) =>
        id === 'electron' ||
        id === 'electron-squirrel-startup' ||
        nodeBuiltins.includes(id) ||
        nodeBuiltins.some((builtin) => id.startsWith(`${builtin}/`)),
      output: {
        entryFileNames: 'main.mjs',
      },
    },
    target: 'node18',
    sourcemap: true,
  },
});
