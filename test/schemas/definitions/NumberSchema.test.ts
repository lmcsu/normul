import { describe, it, expect, expectTypeOf } from 'vitest';
import * as n from 'normul';

const schema = n.number;

describe('NumberSchema', () => {
    it('should return number as is', () => {
        expect(schema.normalize(42).data).toBe(42);
    });

    it('should convert string to number', () => {
        expect(schema.normalize('123').data).toBe(123);
        expect(schema.normalize('3.14').data).toBe(3.14);
        expect(schema.normalize('-7').data).toBe(-7);
        expect(schema.normalize('0x10').data).toBe(16);
        expect(schema.normalize('0b101').data).toBe(5);
        expect(schema.normalize('0o77').data).toBe(63);
    });

    it('should convert boolean to number', () => {
        expect(schema.normalize(true).data).toBe(1);
        expect(schema.normalize(false).data).toBe(0);
    });

    it('should convert NaN and Infinity to 0', () => {
        expect(schema.normalize(Number.NaN).data).toBe(0);
        expect(schema.normalize(Infinity).data).toBe(0);
        expect(schema.normalize(-Infinity).data).toBe(0);
    });

    it('should convert non-number to 0', () => {
        for (const input of [[], {}, 'foo', null, undefined]) {
            const result = schema.normalize(input);
            expect(result.data).toBe(0);
        }
    });
});

expectTypeOf(schema.normalize(1)).toHaveProperty('data').toBeNumber();
