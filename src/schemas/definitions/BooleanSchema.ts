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
            level: 'warn',
            expected: 'boolean',
            received: input,
        });

        const string = String(input).trim().toLowerCase();
        if (['false', '0', 'no'].includes(string)) {
            return false;
        }
        if (['true', '1', 'yes'].includes(string)) {
            return true;
        }

        return !!input;
    }
}
