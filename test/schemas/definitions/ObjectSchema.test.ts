import { describe, it, expect, expectTypeOf } from 'vitest';
import * as n from 'normul';

const schema = n.object({
    a: n.string,
    b: n.number,
});

describe('ObjectSchema', () => {
    it('should normalize object properties', () => {
        const input = { a: 1, b: '2' };
        const result = schema.normalize(input);
        expect(result.data).toEqual({ a: '1', b: 2 });
    });

    it('should convert non-object to object', () => {
        const result = schema.normalize('foo');
        expect(result.data).toEqual({ a: '', b: 0 });
    });
});

expectTypeOf(schema.normalize({ a: 'x', b: 1 })).toHaveProperty('data').toEqualTypeOf<{ a: string; b: number }>();
