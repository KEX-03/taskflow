// ESLint for the React app: catches likely bugs (unused variables, mistakes with hooks),
// not code style. Run it with `npm run lint` from the repository root.
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [js.configs.recommended, reactHooks.configs.flat.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Vite's JSX setup doesn't need `import React`, but the existing imports are harmless
      "no-unused-vars": ["error", { varsIgnorePattern: "^React$" }],
      // Flags loading data in useEffect, which is how these pages are built
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
