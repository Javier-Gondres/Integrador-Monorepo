import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import onlyWarn from "eslint-plugin-only-warn";

/**
 * Shared ESLint rules (no type-aware parser required).
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const coreConfig = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
      import: importPlugin,
      "simple-import-sort": simpleImportSort,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      eqeqeq: ["error", "always"],
      curly: ["error", "all"],
      "import/no-cycle": "error",
      "import/no-duplicates": "error",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  {
    ignores: ["dist/**"],
  },
];

/**
 * Type-aware TypeScript rules (require parserOptions.projectService / project).
 * Used by Nest and other backends via nest.js.
 *
 * @type {import("eslint").Linter.Config["rules"]}
 */
export const typeAwareRules = {
  "@typescript-eslint/no-floating-promises": "error",
  "@typescript-eslint/no-misused-promises": "error",
};

/**
 * Default shared config for frontend packages (errors become warnings).
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  ...coreConfig,
  {
    plugins: {
      onlyWarn,
    },
  },
];
