import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.main.config.mts';

export default  mergeConfig(viteConfig, defineConfig({
  test: {
    include: ['src/test/**/*.spec.ts'],
    watch: false,
  },
}));