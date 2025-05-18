import { describe, it, expect, expectTypeOf } from 'vitest';
import * as n from 'normul';

const stringArray = n.array(n.string);
const numberOrStringArray = n.array(n.number, n.string);

describe('ArraySchema', () => {
    it('should return array as is if valid', () => {
        const input = ['a', 'b'];
        const result = stringArray.normalize(input);
        expect(result.data).toEqual(input);
    });

    it('should wrap non-array input in array', () => {
        const input = 'foo';
        const result = stringArray.normalize(input);
        expect(result.data).toEqual(['foo']);
    });

    it('should normalize elements with multiple schemas (union)', () => {
        const input = [1, 'a', 2];
        const result = numberOrStringArray.normalize(input);
        expect(result.data).toEqual([1, 'a', 2]);
    });

    it('should return empty array for null/undefined', () => {
        expect(stringArray.normalize(null).data).toEqual([]);
        expect(stringArray.normalize(undefined).data).toEqual([]);
    });
});

expectTypeOf(stringArray.normalize(['foo'])).toHaveProperty('data').toEqualTypeOf<string[]>();
expectTypeOf(numberOrStringArray.normalize(['foo'])).toHaveProperty('data').toEqualTypeOf<(string | number)[]>();
