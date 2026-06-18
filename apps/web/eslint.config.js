import globals from 'globals';
import pluginReact from 'eslint-plugin-react';
import { defineConfig, globalIgnores } from 'eslint/config';
import { config as reactHooks } from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default defineConfig([
	globalIgnores(['dist']),
	{ files: ['**/*.{ts,tsx}'] },
	tseslint.configs.recommended,
	pluginReact.configs.flat.recommended,
	pluginReact.configs.flat['jsx-runtime'],
	reactHooks.configs['recommended'],
	{
		files: ['**/*.{ts,tsx}'],
		plugins: {
			'react-refresh': reactRefresh,
		},
		rules: {
			...reactRefresh.configs.recommended.rules,
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
		},
	},
	{
		files: ['**/*.js'],
		languageOptions: {
			globals: globals.browser,
		},
	},
]);
