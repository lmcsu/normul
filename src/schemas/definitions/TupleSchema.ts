import type { ParseContext } from '../../types.js';
import { isArray } from '../../utils.js';
import { Schema } from '../Schema.js';

export class TupleSchema<T extends unknown[]> extends Schema<T> {
    constructor(
        private readonly elementSchemas: { [K in keyof T]: Schema<T[K]> },
    ) { super(); }

    protected _normalize(input: unknown, ctx: ParseContext): T {
        let array: unknown[];

        if (isArray(input)) {
            array = input;
        } else {
            this.makeIssue({
                ctx,
                message: 'Converted to array',
                level: 'warn',
                expected: 'array',
                received: input,
            });
            array = input == null ? [] : [input];
        }

        const result = [];

        for (let i = 0; i < this.elementSchemas.length; i++) {
            ctx.path.push(i);
            result[i] = this.invokeNormalize(this.elementSchemas[i]!, array[i], ctx);
            ctx.path.pop();
        }

        return result as T;
    }
}
