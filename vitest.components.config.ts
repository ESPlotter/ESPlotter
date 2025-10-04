import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
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
  plugins: [react()],
  resolve: {
    alias: appPathAlias,
  },
  test: {
    environment: 'jsdom',
    include: ['src/app/renderer/**/*.spec.{ts,tsx}'],
    setupFiles: ['./vitest.component.setup.ts'],
    watch: false,
  },
});
