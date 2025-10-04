import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
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

// https://vitejs.dev/config
export default defineConfig(async () => {
  return {
    resolve: {
      alias: appPathAlias,
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
    },
    plugins: [react(), tailwindcss()],
  };
});
