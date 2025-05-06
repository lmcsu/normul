import { Schema } from '../Schema.js';

export class UnknownSchema extends Schema<unknown> {
    protected _parse(input: unknown): unknown {
        return input;
    }
}
