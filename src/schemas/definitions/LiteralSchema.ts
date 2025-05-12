import type { ParseContext } from '../../types.js';
import { Schema } from '../Schema.js';

export class LiteralSchema<T extends string | number | boolean | null | undefined> extends Schema<T> {
    constructor(
        private readonly literal: T,
    ) { super(); }

    protected _normalize(input: unknown, ctx: ParseContext): T {
        if (input !== this.literal) {
            this.makeIssue({
                ctx,
                message: 'Normalized literal',
                level: 'info',
                expected: this.literal,
                received: input,
            });
        }

        return this.literal;
    }
}
