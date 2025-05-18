import { describe, it, expect, expectTypeOf } from 'vitest';
import * as n from 'normul';

const schema = n.string;

describe('StringSchema', () => {
    it('should return string as is', () => {
        expect(schema.normalize('foo').data).toBe('foo');
    });

    it('should convert boolean to string', () => {
        expect(schema.normalize(true).data).toBe('true');
        expect(schema.normalize(false).data).toBe('false');
    });

    it('should convert number to string', () => {
        expect(schema.normalize(123).data).toBe('123');
    });

    it('should convert null/undefined to empty string', () => {
        expect(schema.normalize(null).data).toBe('');
        expect(schema.normalize(undefined).data).toBe('');
    });

    it('should convert object/array to JSON string', () => {
        expect(schema.normalize({ a: 1 }).data).toBe('{"a":1}');
        expect(schema.normalize([1, 2, 3]).data).toBe('[1,2,3]');
    });

    it('should handle circular references gracefully', () => {
        const obj: Record<string, unknown> = {};
        obj.foo = obj;
        expect(schema.normalize(obj).data).toBe('[object Object]');
    });
});

expectTypeOf(schema.normalize('foo')).toHaveProperty('data').toBeString();
