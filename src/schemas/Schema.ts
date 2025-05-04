import type { Issue, ParseContext, ParseResult } from '../types.js';

const ISSUE_LEVELS = {
    none: 0,
    error: 1,
    info: 2,
} as const satisfies Record<'none' | Issue['level'], number>;

export abstract class Schema<T> {
    parse(input: unknown, options?: {
        issueLevel: keyof typeof ISSUE_LEVELS;
    }): ParseResult<T> {
        const { issueLevel = 'info' } = options ?? {};

        const ctx: ParseContext = {
            path: [],
            issues: [],
        };
        const data = this._parse(input, ctx);

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

    protected abstract _parse(input: unknown, ctx: ParseContext): T;

    protected invokeParse<U>(schema: Schema<U>, input: unknown, ctx: ParseContext): U {
        return schema._parse(input, ctx);
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
}

export class DefaultSchema<T> extends Schema<T> {
    constructor(
        private inner: Schema<T>,
        private defaultValue: T,
    ) { super(); }

    protected _parse(input: unknown, ctx: ParseContext): T {
        if (input === undefined || input === null) {
            return this.defaultValue;
        }
        return this.invokeParse(this.inner, input, ctx);
    }
}

export class NullableSchema<T> extends Schema<T | null> {
    constructor(
        private inner: Schema<T>,
    ) { super(); }

    protected _parse(input: unknown, ctx: ParseContext): T | null {
        if (input === null) {
            return null;
        }
        return this.invokeParse(this.inner, input, ctx);
    }
}

export class OptionalSchema<T> extends Schema<T | undefined> {
    constructor(
        private inner: Schema<T>,
    ) { super(); }

    protected _parse(input: unknown, ctx: ParseContext): T | undefined {
        if (input === undefined) {
            return undefined;
        }
        return this.invokeParse(this.inner, input, ctx);
    }
}

export class PreprocessSchema<T> extends Schema<T> {
    constructor(
        private inner: Schema<T>,
        private fn: (input: unknown) => unknown,
    ) { super(); }

    protected _parse(input: unknown, ctx: ParseContext): T {
        let prep = input;
        try {
            prep = this.fn(input);
        } catch (error) {
            console.error(error);

            this.makeIssue({
                ctx,
                message: `Caught exception in "pre": ${error}`,
                level: 'error',
            });
        }

        return this.invokeParse(this.inner, prep, ctx);
    }
}

export class TransformSchema<T, U> extends Schema<U> {
    constructor(
        private inner: Schema<T>,
        private fn: (input: T) => U,
    ) { super(); }

    protected _parse(input: unknown, ctx: ParseContext): U {
        const data = this.invokeParse(this.inner, input, ctx);

        try {
            return this.fn(data);
        } catch (error) {
            console.error(error);

            this.makeIssue({
                ctx,
                message: `Caught exception in "post": ${error}`,
                level: 'error',
            });
            return data as unknown as U;
        }
    }
}

export class TypeSchema<T> extends Schema<T> {
    protected _parse(input: unknown): T {
        return input as T;
    }
}
