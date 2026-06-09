const tseslint = require("typescript-eslint");
const prettier = require("eslint-config-prettier");

// NOTE on module sealing: a plain `no-restricted-imports` path pattern cannot tell a module
// importing its OWN internals (legitimate) from one reaching into ANOTHER module's internals
// (forbidden) — it only sees the imported path, not the importer's location. So sealing is
// enforced by the barrel convention (cross-module imports must target `@/modules/<x>` only),
// verified by review and a grep check. For automated enforcement add `eslint-plugin-boundaries`.
module.exports = tseslint.config(
	{
		ignores: ["dist/**", "src/generated/**", "node_modules/**"],
	},
	...tseslint.configs.recommended,
	prettier,
	{
		rules: {
			"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
			"@typescript-eslint/no-explicit-any": "warn",
		},
	}
);
