import globals from "globals";
import tseslint from "typescript-eslint";
import { coreConfig, typeAwareRules } from "./base.js";

/**
 * ESLint flat config for NestJS / Node backends (type-aware).
 * The app must set parserOptions.tsconfigRootDir (import.meta.dirname).
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const nestConfig = [
  ...coreConfig,
  ...tseslint.configs.recommendedTypeChecked,
  {
    ignores: ["eslint.config.mjs"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: "commonjs",
    },
  },
  {
    rules: {
      ...typeAwareRules,
      "@typescript-eslint/no-unsafe-argument": "warn",
    },
  },
];
