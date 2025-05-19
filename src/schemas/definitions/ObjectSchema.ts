import type { Simplify, ParseContext } from '../../types.js';
import { Schema } from '../Schema.js';

export type Shape = Record<string, Schema>;

export type InferShape<S extends Shape> = Simplify<
    {
        [K in keyof S as undefined extends (S[K] extends Schema<infer U> ? U : never)
            ? K
            : never]?: Exclude<S[K] extends Schema<infer U> ? U : never, undefined>
    }
    &
    {
        [K in keyof S as undefined extends (S[K] extends Schema<infer U> ? U : never)
            ? never
            : K]: S[K] extends Schema<infer U> ? U : never
    }
>;

export type ExtractShape<T> = T extends ObjectSchema<infer U> ? U : never;

type Mode = 'strip' | 'passthrough';

export class ObjectSchema<T extends Shape> extends Schema<InferShape<T>> {
    constructor(
        private shape: T,
        private mode: Mode = 'strip',
    ) { super(); }

    protected _normalize(input: unknown, ctx: ParseContext): InferShape<T> {
        if (Object.prototype.toString.call(input) !== '[object Object]') {
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

    get strip(): ObjectSchema<T> {
        return new ObjectSchema(this.shape, 'strip');
    }

    get passthrough(): ObjectSchema<T> {
        return new ObjectSchema(this.shape, 'passthrough');
    }

    extend<U extends Shape>(schemaOrShape: U | ObjectSchema<U>): ObjectSchema<T & U> {
        const newShape = schemaOrShape instanceof ObjectSchema ? schemaOrShape.shape : schemaOrShape;
        return new ObjectSchema(
            { ...this.shape, ...newShape },
            this.mode,
        );
    }

    pick<K extends keyof T>(keys: K[]): ObjectSchema<Pick<T, K>> {
        const pickedShape: Partial<T> = {};
        for (const key of keys) {
            if (key in this.shape) {
                pickedShape[key] = this.shape[key];
            }
        }
        return new ObjectSchema(pickedShape as Pick<T, K>, this.mode);
    }

    omit<K extends keyof T>(keys: K[]): ObjectSchema<Omit<T, K>> {
        const omittedShape: Partial<T> = { ...this.shape };
        for (const key of keys) {
            if (key in omittedShape) {
                delete omittedShape[key];
            }
        }
        return new ObjectSchema(omittedShape as Omit<T, K>, this.mode);
    }

    override preprocess(fn: (input: unknown) => unknown): ObjectSchema<T> {
        const parent = this;

        return new (class extends ObjectSchema<T> {
            constructor() {
                super(parent.shape, parent.mode);
            }

            protected _normalize(input: unknown, ctx: ParseContext) {
                const transformed = fn(input);
                return this.invokeNormalize(parent, transformed, ctx);
            }
        })();
    }
}
