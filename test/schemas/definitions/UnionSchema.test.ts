import { describe, it, expect, expectTypeOf } from 'vitest';
import * as n from 'normul';

const schema = n.union(
    n.string,
    n.number,
);

describe('UnionSchema', () => {
    it('should normalize to first matching schema', () => {
        expect(schema.normalize('foo').data).toBe('foo');
        expect(schema.normalize(123).data).toBe(123);
    });

    it('should fallback to default if no match and default set', () => {
        expect(schema.default(123).normalize(null).data).toBe(123);
    });
});

expectTypeOf(schema.normalize('x')).toHaveProperty('data').toEqualTypeOf<string | number>();
