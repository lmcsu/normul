/* eslint-disable @typescript-eslint/no-explicit-any */

import { Schema } from '../Schema.js';

export class AnySchema extends Schema<any> {
    protected _normalize(input: any): any {
        return input;
    }
}
