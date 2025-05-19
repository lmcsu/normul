import { describe, it, expect, expectTypeOf } from 'vitest';
import * as n from 'normul';

const schema = n.union(
    n.string,
    n.number,
);

const discriminatedSchema = n.discriminatedUnion(
    'type',
    n.object({
        type: n.literal('foo'),
        value: n.string,
    }),
    n.object({
        type: n.literal('bar'),
        value: n.number,
    }),
);

describe('UnionSchema', () => {
    it('should normalize to first matching schema', () => {
        expect(schema.normalize('foo').data).toBe('foo');
        expect(schema.normalize(123).data).toBe(123);
    });
});

describe('DiscriminatedUnionSchema', () => {
    it('should normalize to first matching schema', () => {
        expect(discriminatedSchema.normalize({ type: 'foo', value: 123 }).data.value).toBe('123');
        expect(discriminatedSchema.normalize({ type: 'bar', value: '123' }).data.value).toBe(123);
    });
});

expectTypeOf(schema.normalize('x')).toHaveProperty('data').toEqualTypeOf<string | number>();

expectTypeOf(discriminatedSchema.normalize({ a: 1 })).toHaveProperty('data').toEqualTypeOf<{
    type: 'foo';
    value: string;
} | {
    type: 'bar';
    value: number;
}>();
