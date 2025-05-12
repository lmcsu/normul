import type { ParseContext } from '../../types.js';
import { Schema } from '../Schema.js';

export class BooleanSchema extends Schema<boolean> {
    protected _normalize(input: unknown, ctx: ParseContext): boolean {
        if (typeof input === 'boolean') {
            return input;
        }

        this.makeIssue({
            ctx,
            message: 'Converted to boolean',
            level: 'info',
            expected: 'boolean',
            received: input,
        });

        const string = String(input).trim().toLowerCase();
        return (string === 'true') || !!(Number(string));
    }
}
