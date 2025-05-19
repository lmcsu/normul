import type { ParseContext, Simplify } from '../../types.js';
import { Schema } from '../Schema.js';
import { UnionSchema } from './UnionSchema.js';

export type InferArray<T extends [Schema, ...Schema[]]> =
    Simplify<
        T extends [infer S]
            ? S extends Schema<infer U> ? U[] : never
            : T extends [Schema, ...Schema[]]
                ? (T[number] extends Schema<infer U> ? U : never)[]
                : never
    >;

export class ArraySchema<T extends [Schema, ...Schema[]]> extends Schema<InferArray<T>> {
    constructor(
        private readonly elementSchemas: T,
    ) { super(); }

    protected _normalize(input: unknown, ctx: ParseContext): InferArray<T> {
        let array: unknown[];
        if (Array.isArray(input)) {
            array = input;
        } else {
            this.makeIssue({
                ctx,
                message: 'Converted to array',
                level: 'warn',
                expected: 'array',
                received: input,
            });
            array = (input === null || input === undefined) ? [] : [input];
        }

        let normalizer: (item: unknown, ctx: ParseContext) => unknown;
        if (this.elementSchemas.length === 1) {
            normalizer = (item, ctx) => this.invokeNormalize(this.elementSchemas[0], item, ctx);
        } else {
            const union = new UnionSchema(this.elementSchemas as [Schema, ...Schema[]]);
            normalizer = (item, ctx) => this.invokeNormalize(union, item, ctx);
        }

        return array.map((item, index) => {
            ctx.path.push(index);
            const result = normalizer(item, ctx);
            ctx.path.pop();

            return result;
        }) as InferArray<T>;
    }
}
