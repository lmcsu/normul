import { Schema } from '../Schema.js';

export class UnknownSchema extends Schema {
    protected _parse(input: unknown): unknown {
        return input;
    }
}
