import type { ParseContext } from '../../types.js';
import { isObject } from '../../utils.js';
import { Schema } from '../Schema.js';

export class RecordSchema<K extends string | number, V> extends Schema<Record<K, V>> {
    constructor(
        protected readonly keySchema: Schema<K>,
        protected readonly valueSchema: Schema<V>,
    ) { super(); }

    protected _normalize(input: unknown, ctx: ParseContext): Record<K, V> {
        if (!isObject(input)) {
            this.makeIssue({
                ctx,
                message: 'Converted to object',
                level: 'warn',
                expected: 'object',
                received: input,
            });
        }

        const object: Record<string | number, unknown> = { ...(input as object) };
        const result: Record<string | number, V> = {};
        for (const key in object) {
            ctx.path.push('[key]');
            const normalizedKey = this.invokeNormalize(this.keySchema, key, ctx);
            ctx.path.pop();

            ctx.path.push(normalizedKey);
            result[normalizedKey] = this.invokeNormalize(this.valueSchema, object[key], ctx);
            ctx.path.pop();
        }
        return result;
    }

    get partial(): Schema<Partial<Record<K, V>>> {
        return this;
    }

    protected override cloneArgs(): unknown[] {
        return [this.keySchema, this.valueSchema];
    }
}
