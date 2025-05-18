import { describe, it, expect, expectTypeOf } from 'vitest';
import * as n from 'normul';

const schema = n.tuple(
    n.string,
    n.number,
);

describe('TupleSchema', () => {
    it('should normalize tuple elements', () => {
        const input = ['a', '2'];
        const result = schema.normalize(input);
        expect(result.data).toEqual(['a', 2]);
    });

    it('should convert non-array to tuple', () => {
        const result = schema.normalize('foo');
        expect(result.data).toEqual(['foo', 0]);
    });
});

expectTypeOf(schema.normalize(['x', 1])).toHaveProperty('data').toEqualTypeOf<[string, number]>();
