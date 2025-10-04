import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/app/renderer/**/*.spec.{ts,tsx}'],
    setupFiles: ['./vitest.component.setup.ts'],
    watch: false,
  },
});
