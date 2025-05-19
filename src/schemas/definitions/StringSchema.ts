import type { ParseContext } from '../../types.js';
import { Schema } from '../Schema.js';

export class StringSchema extends Schema<string> {
    protected _normalize(input: unknown, ctx: ParseContext): string {
        if (typeof input === 'string') {
            return input;
        }

        this.makeIssue({
            ctx,
            message: 'Converted to string',
            level: 'warn',
            expected: 'string',
            received: input,
        });

        if (input === null || input === undefined) {
            return '';
        }

        if (typeof input === 'object') {
            try {
                return JSON.stringify(input);
            } catch {
                //
            }
        }

        return String(input);
    }
}
