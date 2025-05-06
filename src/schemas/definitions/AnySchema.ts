/* eslint-disable @typescript-eslint/no-explicit-any */

import { Schema } from '../Schema.js';

export class AnySchema extends Schema<any> {
    protected _parse(input: any): any {
        return input;
    }
}
