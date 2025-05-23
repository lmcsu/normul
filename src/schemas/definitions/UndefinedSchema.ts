import type { ParseContext } from '../../types.js';
import { Schema } from '../Schema.js';

export class UndefinedSchema extends Schema<undefined> {
    protected _normalize(input: unknown, ctx: ParseContext): undefined {
        if (input === undefined) {
            return input;
        }

        this.makeIssue({
            ctx,
            message: 'Converted to undefined',
            level: 'warn',
            expected: 'undefined',
            received: input,
        });

        return undefined;
    }
}
