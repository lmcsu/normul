import type { Issue, ParseContext, ParseResult } from '../types.js';

const ISSUE_LEVELS = {
    none: 0,
    error: 1,
    warn: 2,
    info: 3,
} as const satisfies Record<'none' | Issue['level'], number>;

export abstract class Schema<T = unknown> {
    normalize(input: unknown, options?: {
        issueLevel: keyof typeof ISSUE_LEVELS;
    }): ParseResult<T> {
        const { issueLevel = 'warn' } = options ?? {};

        const ctx: ParseContext = {
            path: [],
            issues: [],
        };
        const data = this._normalize(input, ctx);

        let issues: Issue[] = [];
        const issueLevelThreshold = ISSUE_LEVELS[issueLevel];
        if (issueLevelThreshold > 0) {
            issues = ctx.issues.filter((issue) => {
                return ISSUE_LEVELS[issue.level] <= issueLevelThreshold;
            });
        }

        return {
            data,
            issues,
        };
    }

    protected abstract _normalize(input: unknown, ctx: ParseContext): T;

    protected invokeNormalize<U>(schema: Schema<U>, input: unknown, ctx: ParseContext): U {
        return schema._normalize(input, ctx);
    }

    protected makeIssue(options: {
        ctx: ParseContext;
    } & Omit<Issue, 'path'>) {
        const { ctx, ...rest } = options;

        ctx.issues.push({
            path: [...ctx.path],
            ...rest,
        });
    }

    get optional(): Schema<T | undefined> {
        return new OptionalSchema(this);
    }

    get nullable(): Schema<T | null> {
        return new NullableSchema(this);
    }

    default(value: T): Schema<T> {
        return new DefaultSchema(this, value);
    }

    preprocess(fn: (input: unknown) => unknown): Schema<T> {
        return new PreprocessSchema(this, fn);
    }

    transform<U>(fn: (value: T) => U): Schema<U> {
        return new TransformSchema(this, fn);
    }

    type<T>(): Schema<T> {
        return new TypeSchema<T>();
    }

    fallback(value: T): Schema<T> {
        return new FallbackSchema(this, value);
    }
}

export class DefaultSchema<T> extends Schema<T> {
    constructor(
        private inner: Schema<T>,
        private defaultValue: T,
    ) { super(); }

    protected _normalize(input: unknown, ctx: ParseContext): T {
        if (input === undefined || input === null) {
            this.makeIssue({
                ctx,
                message: 'Using default value',
                level: 'info',
            });

            return this.defaultValue;
        }
        return this.invokeNormalize(this.inner, input, ctx);
    }
}

export class NullableSchema<T> extends Schema<T | null> {
    constructor(
        private inner: Schema<T>,
    ) { super(); }

    protected _normalize(input: unknown, ctx: ParseContext): T | null {
        if (input === null) {
            return null;
        }
        return this.invokeNormalize(this.inner, input, ctx);
    }
}

export class OptionalSchema<T> extends Schema<T | undefined> {
    constructor(
        private inner: Schema<T>,
    ) { super(); }

    protected _normalize(input: unknown, ctx: ParseContext): T | undefined {
        if (input === undefined) {
            return undefined;
        }
        return this.invokeNormalize(this.inner, input, ctx);
    }
}

export class PreprocessSchema<T> extends Schema<T> {
    constructor(
        private inner: Schema<T>,
        private fn: (input: unknown) => unknown,
    ) { super(); }

    protected _normalize(input: unknown, ctx: ParseContext): T {
        let prep = input;
        try {
            prep = this.fn(input);
        } catch (error) {
            console.error(error);

            this.makeIssue({
                ctx,
                message: `Caught exception in preprocess: ${error}`,
                level: 'error',
            });
        }

        return this.invokeNormalize(this.inner, prep, ctx);
    }
}

export class TransformSchema<T, U> extends Schema<U> {
    constructor(
        private inner: Schema<T>,
        private fn: (input: T) => U,
    ) { super(); }

    protected _normalize(input: unknown, ctx: ParseContext): U {
        const data = this.invokeNormalize(this.inner, input, ctx);

        try {
            return this.fn(data);
        } catch (error) {
            console.error(error);

            this.makeIssue({
                ctx,
                message: `Caught exception in transform: ${error}`,
                level: 'error',
            });
            return data as unknown as U;
        }
    }
}

export class TypeSchema<T> extends Schema<T> {
    protected _normalize(input: unknown): T {
        return input as T;
    }
}

export class FallbackSchema<T> extends Schema<T> {
    constructor(
        private readonly inner: Schema<T>,
        private readonly fallbackValue: T,
    ) { super(); }

    protected _normalize(input: unknown, ctx: ParseContext): T {
        const innerCtx: ParseContext = {
            issues: [],
            path: [],
        };

        const data = this.invokeNormalize(this.inner, input, innerCtx);

        ctx.issues.push(...innerCtx.issues);

        const shouldFallback = innerCtx.issues.some((issue) => {
            return (
                issue.level !== 'info' &&
                issue.path.length === 0
            );
        });

        if (shouldFallback) {
            this.makeIssue({
                ctx,
                message: 'Using fallback value',
                level: 'info',
            });
            return this.fallbackValue;
        }

        return data;
    }
}
