import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import i18next from "eslint-plugin-i18next";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      i18next,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      "i18next/no-literal-string": [
        "warn",
        {
          markupOnly: true,
          ignoreAttribute: [
            "className",
            "class",
            "style",
            "type",
            "id",
            "data-testid",
            "data-test",
            "role",
            "aria-label",
            "aria-labelledby",
            "aria-describedby",
            "name",
            "method",
            "target",
            "rel",
            "href",
            "src",
            "alt",
            "fill",
            "stroke",
            "d",
            "viewBox",
            "xmlns",
            "width",
            "height",
            "key",
            "variant",
            "size",
            "as",
            "locale",
          ],
          ignore: [
            "^[0-9]+$",           // Numbers
            "^[A-Z_]+$",          // Constants like API_URL
            "^/$",                // Single characters
            "^/.*",               // URLs/paths starting with /
            "https?://.*",        // HTTP(S) URLs
          ],
        },
      ],
    },
  },
  // Disable i18next for test files
  {
    files: ["**/__tests__/**", "**/*.test.tsx", "**/*.test.ts", "**/*.spec.tsx", "**/*.spec.ts"],
    rules: {
      "i18next/no-literal-string": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
  ]),
]);

export default eslintConfig;
