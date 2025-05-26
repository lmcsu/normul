import type { ParseContext } from '../../types.js';
import { isNumber } from '../../utils.js';
import { Schema } from '../Schema.js';

export class NumberSchema extends Schema<number> {
    protected _normalize(input: unknown, ctx: ParseContext): number {
        if (isNumber(input)) {
            return input;
        }

        const number = Number(input);

        if (isNumber(number)) {
            this.makeIssue({
                ctx,
                message: 'Converted to number',
                level: 'warn',
                expected: 'number',
                received: input,
            });

            return number;
        } else {
            this.makeIssue({
                ctx,
                message: 'Converted to 0',
                level: 'warn',
                expected: 'number',
                received: input,
            });

            return 0;
        }
    }
}
