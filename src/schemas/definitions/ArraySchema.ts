import type { ParseContext } from '../../types.js';
import { Schema } from '../Schema.js';

export class ArraySchema<T> extends Schema<T[]> {
    constructor(
        private readonly elementSchema: Schema<T>,
    ) { super(); }

    protected _parse(input: unknown, ctx: ParseContext): T[] {
        let array;
        if (Array.isArray(input)) {
            array = input;
        } else {
            this.makeIssue({
                ctx,
                message: 'Converted to array',
                level: 'info',
                expected: 'array',
                received: input,
            });

            array = (input === null || input === undefined) ? [] : [input];
        }

        return array.map((item, index) => {
            ctx.path.push(index);
            const result = this.invokeParse(this.elementSchema, item, ctx);
            ctx.path.pop();

            return result;
        });
    }
}
