import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import type { Linter } from 'eslint';
import n from 'eslint-plugin-n';
import unicorn from 'eslint-plugin-unicorn';
import ts from 'typescript-eslint';
import globals from 'globals';

export default [
    {
        ignores: ['./lib/**/*'],
    },
    js.configs.recommended,
    stylistic.configs.recommended,
    stylistic.configs.customize({
        arrowParens: true,
        braceStyle: '1tbs',
        indent: 4,
        jsx: false,
        semi: true,
    }),
    ...ts.configs.strictTypeChecked,
    ...ts.configs.stylisticTypeChecked,
    n.configs['flat/recommended-module'],
    unicorn.configs.recommended,
    {
        files: ['./src/**/*'],
        languageOptions: {
            globals: {
                ...globals.es2023,
            },
            parserOptions: {
                project: './tsconfig.lib.json',
                sourceType: 'module',
            },
        },
    },
    {
        files: ['./*.js', './*.ts'],
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.es2023,
            },
            parserOptions: {
                project: './tsconfig.node.json',
                sourceType: 'module',
            },
        },
    },
    {
        rules: {
            'curly': ['error', 'all'],
            'no-duplicate-imports': ['error'],
            '@stylistic/arrow-parens': ['error', 'as-needed', {
                requireForBlockBody: true,
            }],
            '@stylistic/max-len': ['error', 132],
            '@stylistic/operator-linebreak': ['error', 'after'],
            '@typescript-eslint/no-base-to-string': ['off'],
            '@typescript-eslint/no-non-null-assertion': ['off'],
            '@typescript-eslint/no-this-alias': ['off'],
            '@typescript-eslint/restrict-template-expressions': ['off'],
            'unicorn/filename-case': ['off'],
            'unicorn/no-await-expression-member': ['off'],
            'unicorn/no-lonely-if': ['off'],
            'unicorn/no-null': ['off'],
            'unicorn/no-this-assignment': ['off'],
            'unicorn/prevent-abbreviations': ['off'],
            'unicorn/relative-url-style': ['error', 'always'],
        },
    },
] satisfies (Linter.Config | ReturnType<(typeof ts)['config']>[number])[];
