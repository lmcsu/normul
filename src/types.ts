import type { Schema } from './schemas/Schema.js';

export type Simplify<T> = { [K in keyof T]: T[K] } & {};

export type Infer<T extends Schema<unknown>> =
    T extends Schema<infer U>
        ? Simplify<U>
        : never;

export interface Issue {
    path: (string | number)[];
    message: string;
    level: 'info' | 'error';
    expected?: string | number | boolean | undefined | null;
    received?: unknown;
}

export interface ParseResult<T> {
    data: T;
    issues: Issue[];
}

export interface ParseContext {
    path: (string | number)[];
    issues: Issue[];
}
