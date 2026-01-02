import importPlugin from "eslint-plugin-import";
import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import tseslint from "typescript-eslint"; // Updated 2026 recommended approach
import tsParser from "@typescript-eslint/parser";

module.exports = [
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
        tsconfigRootDir: __dirname,
      },
      globals: {
        require: "readonly",
        module: "readonly",
        __dirname: "readonly",
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        describe: "readonly",
        it: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        expect: "readonly",
        jest: "readonly",
        fetch: "readonly",
      },
    },
    rules: {
      // "no-unused-vars": "off",
      "no-empty": "warn",
      "no-console": "off",
      "no-undef": "warn",
      "no-unused-expressions": "error",
      "prettier/prettier": "error",
      "no-useless-catch": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", }],
      // "@typescript-eslint/no-unused-vars": [
      //   "error",
      //   {
      //     argsIgnorePattern: "^_",
      //     varsIgnorePattern: "^_",
      //   },
      // ],
    },
  },
  prettier,
  {
    ignores: ["commitlint.config.ts", "eslint.config.ts", "node_modules/", "dist/", "build/", "public/", "docs/"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    settings: {
      "import/resolver": {
        node: true,
      },
    },
  },
];
