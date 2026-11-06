import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "dist-electron", "out", "src/main/generated", "src/components"]),
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    ignores: ["src/renderer/**"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2022, globals: globals.node },
  },
  {
    files: ["src/renderer/**/*.{js,jsx,ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    rules: {
      // Non-component exports that live next to their components (shadcn variants, context hooks).
      "react-refresh/only-export-components": [
        "error",
        { allowExportNames: ["buttonVariants", "badgeVariants", "useAuth", "useTheme", "themes", "modes"] },
      ],
    },
  },
]);
