import importPlugin from "eslint-plugin-import";
import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import tseslint from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default tseslint.config( // Using the tseslint helper provides better type safety
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    plugins: {
      import: importPlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd(),
      },
      globals: {
        // These are standard Node globals
        process: "readonly",
        console: "readonly",
        // Note: module/require/__dirname don't exist in true ESM
      },
    },
    rules: {
      "no-empty": "warn",
      "no-console": "off",
      "no-undef": "warn",
      "no-unused-expressions": "error",
      "prettier/prettier": "error",
      "no-useless-catch": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", }],
    },
  },
  prettier,
  {
    files: ["src/__tests__/**/*.ts", "**/*.test.ts", "**/*.spec.ts"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
  {
    ignores: ["commitlint.config.ts", "eslint.config.ts", "node_modules/", "dist/", "build/"],
  }
);
