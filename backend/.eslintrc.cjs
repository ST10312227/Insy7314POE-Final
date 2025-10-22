// backend/.eslintrc.cjs
module.exports = {
  root: true,
  env: { node: true, es2022: true },
  extends: [
    'eslint:recommended',
    'plugin:security/recommended',
  ],
  plugins: ['security', 'node'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'script' },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
  },
  ignorePatterns: ['node_modules/', 'dist/', 'coverage/', 'build/'],
  overrides: [
    {
      files: ['tests/**/*', '**/*.test.js'],
      env: { jest: true, node: true, es2022: true },
      rules: {

        'no-console': 'off',
      },
    },
  ],
};
