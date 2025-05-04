import type { ParseContext } from '../../types.js';
import { Schema } from '../Schema.js';

export class NumberSchema extends Schema<number> {
    protected _parse(input: unknown, ctx: ParseContext): number {
        if (typeof input === 'number') {
            return input;
        }

        this.makeIssue({
            ctx,
            message: 'Converted to number',
            level: 'info',
            expected: 'number',
            received: input,
        });

        const number = Number(input);
        return Number.isNaN(number) ? 0 : number;
    }
}
