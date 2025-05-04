import type { ParseContext } from '../../types.js';
import { Schema } from '../Schema.js';

export class RecordSchema<T> extends Schema<Record<string, T>> {
    constructor(
        private valueSchema: Schema<T>,
    ) { super(); }

    protected _parse(input: unknown, ctx: ParseContext): Record<string, T> {
        if (Object.prototype.toString.call(input) !== '[object Object]') {
            this.makeIssue({
                ctx,
                message: 'Converted to object',
                level: 'info',
                expected: 'object',
                received: input,
            });
        }

        const object: Record<string, unknown> = { ...(input as object) };
        const result: Record<string, T> = {};
        for (const key in object) {
            ctx.path.push(key);
            result[key] = this.invokeParse(this.valueSchema, object[key], ctx);
            ctx.path.pop();
        }
        return result;
    }
}
