module.exports = {
	root: true,
	env: {
	  browser: true,
	  node: true,
	  es2021: true
	},
	ignorePatterns: ["node_modules/", ".eslintrc.js"],
	parser: "@typescript-eslint/parser",
	parserOptions: {
	  ecmaVersion: 2021,
	  sourceType: "module",
	  ecmaFeatures: { jsx: true }
	},
	plugins: [
	  "react",
	  "react-hooks",
	  "@typescript-eslint",
	  "prettier",
	  "simple-import-sort",
	  "sonarjs"
	],
	extends: [
	  "eslint:recommended",
	  "plugin:react/recommended",
	  "plugin:@typescript-eslint/recommended",
	  "plugin:prettier/recommended"
	],
	rules: {
	  "react/react-in-jsx-scope": "off",
	  "indent": "off",
	  "prettier/prettier": "error",
	  "quotes": ["error", "double", { avoidEscape: true }],
	  "jsx-quotes": ["error", "prefer-double"],
	  "semi": ["error", "always"],
	  "comma-dangle": ["error", "always-multiline"],
	  "max-len": ["warn", { code: 120, ignoreUrls: true, ignoreStrings: true, ignoreComments: true }],
	  "simple-import-sort/imports": ["error", {
		groups: [
		  ["^react", "^@?\\w"],
		  ["^src/"],
		  ["^\\u0000"],
		  ["^\\.\\.(?!/?$)", "^\\.\\./?$", "^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"]
		]
	  }],
	  "sonarjs/no-duplicate-string": "warn",
	  "sonarjs/cognitive-complexity": ["warn", 20]
	},
	settings: {
	  react: { version: "detect" }
	}
};
  