import type { Simplify, ParseContext } from '../../types.js';
import { isObject } from '../../utils.js';
import { Schema } from '../Schema.js';

export type Shape = Record<string, Schema>;

export type InferShape<S extends Shape> = Simplify<
    {
        [K in keyof S as undefined extends (S[K] extends Schema<infer U> ? U : never) ? K : never]?:
        Exclude<S[K] extends Schema<infer U> ? U : never, undefined>
    }
    &
    {
        [K in keyof S as undefined extends (S[K] extends Schema<infer U> ? U : never) ? never : K]:
        S[K] extends Schema<infer U> ? U : never
    }
>;

export type ExtractShape<T> = T extends ObjectSchema<infer U> ? U : never;

export class ObjectSchema<T extends Shape> extends Schema<InferShape<T>> {
    protected mode: 'strip' | 'passthrough' = 'strip';

    constructor(
        protected shape: T,
    ) { super(); }

    protected _normalize(input: unknown, ctx: ParseContext): InferShape<T> {
        if (!isObject(input)) {
            this.makeIssue({
                ctx,
                message: 'Converted to object',
                level: 'warn',
                expected: 'object',
                received: input,
            });
        }

        const object: Record<string, unknown> = { ...(input as object) };

        const result: Record<string, unknown> = {};

        for (const key in this.shape) {
            ctx.path.push(key);
            result[key] = this.invokeNormalize(this.shape[key]!, object[key], ctx);
            ctx.path.pop();
        }

        if (this.mode === 'passthrough') {
            for (const key in object) {
                if (!(key in this.shape)) {
                    result[key] = object[key];
                }
            }
        }

        return result as InferShape<T>;
    }

    get strip(): this {
        const result = this.clone();
        result.mode = 'strip';
        return result;
    }

    get passthrough(): this {
        const result = this.clone();
        result.mode = 'passthrough';
        return result;
    }

    extend<U extends Shape>(schemaOrShape: U | ObjectSchema<U>): ObjectSchema<T & U> {
        const result = this.clone() as unknown as ObjectSchema<T & U>;
        result.shape = {
            ...result.shape,
            ...(schemaOrShape instanceof ObjectSchema ? schemaOrShape.shape : schemaOrShape),
        };
        return result;
    }

    pick<K extends keyof T>(keys: K[]): ObjectSchema<Pick<T, K>> {
        const pickedShape: Partial<T> = {};
        for (const key of keys) {
            if (key in this.shape) {
                pickedShape[key] = this.shape[key];
            }
        }
        const result = this.clone() as unknown as ObjectSchema<Pick<T, K>>;
        result.shape = pickedShape as Pick<T, K>;
        return result;
    }

    omit<K extends keyof T>(keys: K[]): ObjectSchema<Omit<T, K>> {
        const omittedShape: Partial<T> = { ...this.shape };
        for (const key of keys) {
            if (key in omittedShape) {
                delete omittedShape[key];
            }
        }
        const result = this.clone() as unknown as ObjectSchema<Omit<T, K>>;
        result.shape = omittedShape as Omit<T, K>;
        return result;
    }

    protected override cloneArgs() {
        return [this.shape];
    }

    protected override cloneProps(target: this) {
        target.mode = this.mode;
    }
}
