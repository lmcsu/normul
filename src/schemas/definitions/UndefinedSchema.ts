import type { ParseContext } from '../../types.js';
import { Schema } from '../Schema.js';

export class UndefinedSchema extends Schema<undefined> {
    protected _parse(input: unknown, ctx: ParseContext): undefined {
        if (input === undefined) {
            return input;
        }

        this.makeIssue({
            ctx,
            message: 'Converted to undefined',
            level: 'info',
            expected: 'undefined',
            received: input,
        });

        return undefined;
    }
}
