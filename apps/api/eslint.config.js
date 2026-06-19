const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const { defineConfig, globalIgnores } = require('eslint/config');

module.exports = defineConfig([
	globalIgnores(['dist/**', 'coverage/**']),
	{
		files: ['**/*.{ts,js}'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.eslint.json',
				tsconfigRootDir: __dirname,
				sourceType: 'module',
			},
			ecmaVersion: 'latest',
		},
		plugins: {
			'@typescript-eslint': tseslint,
		},
		rules: {
			...tseslint.configs.recommended.rules,
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
		},
	},
]);
