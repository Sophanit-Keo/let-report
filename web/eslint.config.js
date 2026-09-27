// ESLint (npm run lint): catches undefined names and unused imports.
export default [
  {
    files: ['src/**/*.{js,jsx}', 'scripts/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        window: 'readonly', document: 'readonly', navigator: 'readonly', URL: 'readonly', URLSearchParams: 'readonly',
        Image: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', setInterval: 'readonly', clearInterval: 'readonly',
        process: 'readonly', console: 'readonly', fetch: 'readonly', __SUPABASE_URL__: 'readonly', __SUPABASE_ANON_KEY__: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
    },
  },
];
