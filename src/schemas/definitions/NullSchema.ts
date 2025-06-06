import type { ParseContext } from '../../types.js';
import { Schema } from '../Schema.js';

export class NullSchema extends Schema<null> {
    protected _normalize(input: unknown, ctx: ParseContext): null {
        if (input === null) {
            return input;
        }

        this.makeIssue({
            ctx,
            message: 'Converted to null',
            level: 'warn',
            expected: 'null',
            received: input,
        });

        return null;
    }
}
