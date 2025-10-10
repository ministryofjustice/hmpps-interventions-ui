import { defineConfig, globalIgnores } from 'eslint/config'
import _import from 'eslint-plugin-import'
import { fixupPluginRules } from '@eslint/compat'
import globals from 'globals'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import pluginCypress from 'eslint-plugin-cypress'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default defineConfig([
  globalIgnores([
    '**/node_modules',
    '**/public',
    '**/assets',
    '**/cypress.config.ts',
    '**/reporter-config.json',
    '**/dist/',
    'script/build/',
    'browser/build/',
  ]),
  {
    // --- Generic JS/Base Config Block ---
    extends: compat.extends('plugin:prettier/recommended'),

    plugins: {
      import: fixupPluginRules(_import),
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },

    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },

      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },

        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      },
    },

    rules: {
      'no-unused-vars': [
        1,
        {
          argsIgnorePattern: 'res|next|^err|_',
          ignoreRestSiblings: true,
        },
      ],

      'no-use-before-define': 0,
      semi: 0,
      'import/no-unresolved': 'error',

      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
          mjs: 'never',
          jsx: 'never',
          ts: 'never',
          tsx: 'never',
        },
      ],

      'comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'never',
        },
      ],

      // 🚀 THE FIX IS HERE
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.js',
            '**/*.test.ts',
            'testutils/factories/*.ts',
            'mockApis/**/*.ts',
            'eslint.config.mjs', // ✅ Add this line
          ],
        },
      ],

      'prettier/prettier': [
        'error',
        {
          trailingComma: 'es5',
          singleQuote: true,
          printWidth: 120,
          semi: false,
          arrowParens: 'avoid',
        },
      ],

      'no-shadow': 'off',
    },
  },
  {
    // --- TypeScript Config Block ---
    files: ['**/*.ts'],
    ignores: ['**/*.js'],

    extends: compat.extends(
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
      'plugin:prettier/recommended'
    ),

    plugins: {
      '@typescript-eslint': typescriptEslint,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'script',

      parserOptions: {
        project: ['./tsconfig.json', 'script/tsconfig.json', 'browser/tsconfig.json'],
      },
    },

    rules: {
      '@typescript-eslint/no-use-before-define': 0,
      'class-methods-use-this': 0,
      'no-useless-constructor': 0,
      'no-shadow': 'off', // Base rule must be disabled to use the TS version
      '@typescript-eslint/no-shadow': 'error',

      '@typescript-eslint/no-unused-vars': [
        1,
        {
          argsIgnorePattern: 'res|next|^err|_',
          ignoreRestSiblings: true,
        },
      ],

      '@typescript-eslint/semi': 0,
      'import/no-unresolved': 'error',

      'prettier/prettier': [
        'error',
        {
          trailingComma: 'es5',
          singleQuote: true,
          printWidth: 120,
          semi: false,
          arrowParens: 'avoid',
        },
      ],

      '@typescript-eslint/no-non-null-assertion': 0,
      '@typescript-eslint/no-floating-promises': 1,
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    // --- Cypress Config Block ---
    files: ['cypress/**/*.{js,ts,jsx,tsx}'],

    plugins: {
      cypress: pluginCypress,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...pluginCypress.configs.globals.globals,
      },
    },

    rules: {
      ...pluginCypress.configs.recommended.rules,
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'no-unused-expressions': 'off',
      'cypress/no-unused-expressions': 'error',
    },
  },
])
