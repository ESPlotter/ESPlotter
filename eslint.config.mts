import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import globals from "globals";

export default defineConfig([
  {
    ignores: ["**/.vite/**", "out/**", "dist/**", "coverage/**"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,cts,mts}"],
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
      "@typescript-eslint": tseslint.plugin,
      import: eslintPluginImport,
      unicorn: eslintPluginUnicorn,
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: [
            "./tsconfig.node.json",
            "./tsconfig.web.json",
            "./tsconfig.playwright.json",
          ],
        },
        node: true,
      },
    },
    rules: {
      ...eslintPluginImport.configs.recommended.rules,
      ...eslintPluginUnicorn.configs.recommended.rules,
    },
  },
]);
