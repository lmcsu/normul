import { describe, it, expect, expectTypeOf } from 'vitest';
import * as n from 'normul';

const schema = n.any;

describe('AnySchema', () => {
    it('should return input as is', () => {
        const values = [null, undefined, 1, 'a', {}, [], true, false];
        for (const input of values) {
            const result = schema.normalize(input);
            expect(result.data).toBe(input);
        }
    });
});

expectTypeOf(schema.normalize(true)).toHaveProperty('data').toBeAny();
