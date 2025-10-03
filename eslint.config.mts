import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';

export default defineConfig([
  {
    ignores: ['**/.vite/**', 'out/**', 'dist/**', 'coverage/**'],
  },
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  {
    files: ['**/*.{ts,tsx,cts,mts}'],
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
      unicorn: eslintPluginUnicorn,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: [
            './tsconfig.node.json',
            './tsconfig.web.json',
            './tsconfig.playwright.json',
          ],
        },
        node: true,
      },
    },
    rules: {
      ...eslintPluginImport.configs.recommended.rules,
      ...eslintPluginUnicorn.configs.recommended.rules,
      indent: ['error', 2],
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      semi: ['error', 'always'],
      'unicorn/expiring-todo-comments': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prefer-top-level-await': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/prefer-query-selector': 'off',
    },
  },
]);
