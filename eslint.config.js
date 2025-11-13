import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

export default tseslint.config([
    // API config
    {
        files: ["API/**/*.{js,ts}"],
        extends: [js.configs.recommended, tseslint.configs.recommended],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                tsconfigRootDir: new URL(".", import.meta.url).pathname,
            },
        },
        rules: {
            semi: ["error", "always"], // semi: true
            quotes: ["error", "double"], // double quotes
            "comma-dangle": ["error", "only-multiline"], // trailingComma: es5
            indent: ["error", "tab", { SwitchCase: 1 }], // use 4 spaces for tabs
            "max-len": ["error", { code: 200 }], // printWidth: 200
            "linebreak-style": ["error", "windows"], // endOfLine: crlf
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        },
    },
    // UI config
    globalIgnores(["dist"]),
    {
        files: ["UI/**/*.{ts,tsx}"],
        extends: [js.configs.recommended, tseslint.configs.recommended, reactHooks.configs["recommended-latest"], reactRefresh.configs.vite],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                tsconfigRootDir: new URL(".", import.meta.url).pathname,
            },
        },
        rules: {
            semi: ["error", "always"], // semi: true
            quotes: ["error", "double"], // double quotes
            "comma-dangle": ["error", "only-multiline"], // trailingComma: es5
            indent: ["error", "tab"], // useTabs: true
            "max-len": ["error", { code: 200 }], // printWidth: 200
            "linebreak-style": ["error", "windows"], // endOfLine: crlf
        },
    },
]);
