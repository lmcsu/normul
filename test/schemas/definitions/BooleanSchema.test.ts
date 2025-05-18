import { describe, it, expect, expectTypeOf } from 'vitest';
import * as n from 'normul';

const schema = n.boolean;

describe('BooleanSchema', () => {
    it('should return boolean as is', () => {
        for (const input of [true, false]) {
            const result = schema.normalize(input);
            expect(result.data).toBe(input);
        }
    });

    it('should convert string representations of false to boolean false', () => {
        for (const input of ['false', 'False', 'FALSE', '0', 'no', 'No', 'NO']) {
            const result = schema.normalize(input);
            expect(result.data).toBe(false);
        }
    });

    it('should convert string representations of true to boolean true', () => {
        for (const input of ['true', 'True', 'TRUE', '1', 'yes', 'Yes', 'YES']) {
            const result = schema.normalize(input);
            expect(result.data).toBe(true);
        }
    });

    it('should convert falsy non-boolean values to boolean false', () => {
        for (const input of [0, null, '', undefined]) {
            const result = schema.normalize(input);
            expect(result.data).toBe(false);
        }
    });

    it('should convert truthy non-boolean values to boolean true', () => {
        for (const input of [{}, [], 1, -1, ' ', 'foo']) {
            const result = schema.normalize(input);
            expect(result.data).toBe(true);
        }
    });
});

expectTypeOf(schema.normalize(true)).toHaveProperty('data').toBeBoolean();
