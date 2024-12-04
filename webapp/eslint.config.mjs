import eslint from "@eslint/js";

import eslintPluginJsonc from 'eslint-plugin-jsonc';

import eslintPluginPrettierRecommended from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  ...eslintPluginJsonc.configs['flat/recommended-with-jsonc'],
  {
    plugins: {
      "eslint-plugin-prettier": eslintPluginPrettierRecommended,
    },
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    ignores: ["package.json"],
    rules: {
      // https://github.com/lydell/eslint-plugin-simple-import-sort
      "simple-import-sort/imports": [
        "error",
        {
          // https://dev.to/receter/automatic-import-sorting-in-vscode-275m
          groups: [["^@?\\w", "^node"], ["^[^@]?\\w"]],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["**/*.json"],
    ignores: ["package.json"],
    rules: {
      "jsonc/sort-keys": ["error"]
    }
  }
);
