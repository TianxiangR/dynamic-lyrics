module.exports = {
    'env': {
      'browser': true,
      'es2021': true
    },
    'extends': [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react/recommended'
    ],
    'overrides': [
      {
        'env': {
          'node': true
        },
        'files': [
          '.eslintrc.{js,cjs}'
        ],
        'parserOptions': {
          'sourceType': 'script'
        }
      }
    ],
    ignorePatterns: ['.eslintrc.js', 'commitlint.config.js', 'build/**'],
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
      'ecmaVersion': 'latest',
      'sourceType': 'module'
    },
    'plugins': [
      '@typescript-eslint',
      'react'
    ],
    'rules': {
      'indent': [
        'error',
        2
      ],
      'quotes': [
        'error',
        'single'
      ],
      'semi': [
        'error',
        'always'
      ],
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-function': 'warn'
    }
  };