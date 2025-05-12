import { Schema } from '../Schema.js';

export class UnknownSchema extends Schema {
    protected _normalize(input: unknown): unknown {
        return input;
    }
}
