import type { Issue, ParseContext, ParseResult } from '../types.js';

export abstract class Schema<T = unknown> {
    protected modifiers: ((
        input: unknown,
        ctx: ParseContext,
        next: (input: unknown, ctx: ParseContext) => unknown,
    ) => unknown)[] = [];

    normalize(input: unknown): ParseResult<T> {
        const ctx: ParseContext = {
            path: [],
            issues: [],
        };

        const data = this.invokeNormalize(this, input, ctx);

        return {
            data,
            issues: ctx.issues,
        };
    }

    protected abstract _normalize(input: unknown, ctx: ParseContext): T;

    protected invokeNormalize<U>(schema: Schema<U>, input: unknown, ctx: ParseContext): U {
        let currentModifierIndex = schema.modifiers.length - 1;
        const next = (input: unknown, ctx: ParseContext): unknown => {
            if (currentModifierIndex >= 0) {
                const fn = schema.modifiers[currentModifierIndex--]!;
                return fn(input, ctx, next);
            }
            return schema._normalize(input, ctx);
        };
        return next(input, ctx) as U;
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
        const result = this.clone();

        result.modifiers.push((input, ctx, next) => {
            if (input === undefined) {
                return undefined;
            }
            return next(input, ctx);
        });

        return result as Schema<T | undefined>;
    }

    get nullable(): Schema<T | null> {
        const result = this.clone();

        result.modifiers.push((input, ctx, next) => {
            if (input === null) {
                return null;
            }
            return next(input, ctx);
        });

        return result as Schema<T | null>;
    }

    default(value: T): this {
        const result = this.clone();

        result.modifiers.push((input, ctx, next) => {
            if (input === undefined || input === null) {
                this.makeIssue({
                    ctx,
                    message: 'Using default value',
                    level: 'info',
                });
                return value;
            }
            return next(input, ctx);
        });

        return result;
    }

    preprocess(fn: (input: unknown) => unknown): this {
        const result = this.clone();

        result.modifiers.push((input, ctx, next) => {
            let data = input;
            try {
                data = fn(input);
            } catch (error) {
                console.error(error);

                this.makeIssue({
                    ctx,
                    message: `Caught exception in preprocess: ${error}`,
                    level: 'error',
                });
            }
            return next(data, ctx);
        });

        return result;
    }

    transform<U>(fn: (value: T) => U): Schema<U> {
        const result = this.clone();

        result.modifiers.push((input, ctx, next) => {
            const data = next(input, ctx) as T;

            try {
                return fn(data);
            } catch (error) {
                console.error(error);

                this.makeIssue({
                    ctx,
                    message: `Caught exception in transform: ${error}`,
                    level: 'error',
                });
                return data as unknown as U;
            }
        });

        return result as unknown as Schema<U>;
    }

    type<T>(): TypeSchema<T> {
        return new TypeSchema<T>(this);
    }

    get any(): AnySchema {
        return new AnySchema(this);
    }

    get unknown(): UnknownSchema {
        return new UnknownSchema(this);
    }

    fallback(value: T): this {
        const result = this.clone();

        result.modifiers.push((input, ctx, next) => {
            const innerCtx: ParseContext = {
                issues: [],
                path: [],
            };

            const data = next(input, innerCtx);

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
                return value;
            }

            return data;
        });

        return result;
    }

    protected clone(): this {
        const Constructor = this.constructor as new (...args: unknown[]) => this;
        const result = new Constructor(...this.cloneArgs());

        result.modifiers = [...this.modifiers];

        this.cloneProps(result);

        return result;
    }

    protected cloneArgs(): unknown[] {
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected cloneProps(target: this): void {
        //
    }
}

export class TypeSchema<T> extends Schema<T> {
    constructor(
        protected inner?: Schema,
    ) { super(); }

    protected _normalize(input: unknown, ctx: ParseContext): T {
        return this.inner ?
            this.invokeNormalize(this.inner, input, ctx) as T :
            input as T;
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class AnySchema extends TypeSchema<any> {
    //
}

export class UnknownSchema extends TypeSchema<unknown> {
    //
}
