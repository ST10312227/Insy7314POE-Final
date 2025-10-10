// frontend/.eslintrc.cjs
const js = require('@eslint/js');

module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    js.configs.recommended,
    'plugin:react/recommended',
  ],
  plugins: ['react', 'react-refresh', 'react-hooks'],
  settings: { react: { version: 'detect' } },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  ignorePatterns: ['node_modules/', 'dist/'],
};
