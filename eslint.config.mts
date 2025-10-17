import { fileURLToPath } from 'node:url';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import eslintPluginImport from 'eslint-plugin-import';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

const tsconfigRootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig([
  {
    ignores: ['**/.vite/**', 'out/**', 'dist/**', 'coverage/**'],
  },
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: ['**/*.{ts,tsx,cts,mts}', '**/.d.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: false,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: eslintPluginImport,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          tsconfigRootDir,
          project: ['./tsconfig.node.json', './tsconfig.web.json', './tsconfig.playwright.json'],
        },
        node: true,
      },
    },
    rules: {
      ...eslintPluginImport.configs.recommended.rules,
    },
  },
  {
    files: ['src/app/renderer/**/*.{ts,tsx}'],
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/app/renderer',
              from: './src/app/preload',
              message: 'Renderer cannot import modules from the preload bundle.',
            },
            {
              target: './src/app/renderer',
              from: './src/app/main',
              message: 'Renderer cannot import modules from the main bundle.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/main/**/*.{ts,tsx}'],
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/app/main',
              from: './src/app/renderer',
              message: 'Main process cannot import modules from the renderer bundle.',
            },
            {
              target: './src/app/main',
              from: './src/app/preload',
              message: 'Main process cannot import modules from the preload bundle.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/preload/**/*.{ts,tsx}'],
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/app/preload',
              from: './src/app/renderer',
              message: 'Preload bundle cannot import modules from the renderer bundle.',
            },
            {
              target: './src/app/preload',
              from: './src/app/main',
              message: 'Preload bundle cannot import modules from the main bundle.',
            },
          ],
        },
      ],
    },
  },
]);
