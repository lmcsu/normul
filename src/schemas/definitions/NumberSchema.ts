import type { ParseContext } from '../../types.js';
import { Schema } from '../Schema.js';

export class NumberSchema extends Schema<number> {
    protected _normalize(input: unknown, ctx: ParseContext): number {
        if (
            typeof input === 'number' &&
            !Number.isNaN(input) &&
            input !== Infinity &&
            input !== -Infinity
        ) {
            return input;
        }

        const number = Number(input);

        if (
            Number.isNaN(number) ||
            number === Infinity ||
            number === -Infinity
        ) {
            this.makeIssue({
                ctx,
                message: 'Converted to 0',
                level: 'info',
                expected: 'number',
                received: input,
            });

            return 0;
        } else {
            this.makeIssue({
                ctx,
                message: 'Converted to number',
                level: 'info',
                expected: 'number',
                received: input,
            });

            return number;
        }
    }
}
