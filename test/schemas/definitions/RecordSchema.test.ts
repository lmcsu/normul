import { describe, it, expect, expectTypeOf } from 'vitest';
import * as n from 'normul';

const valueOnlySchema = n.record(
    n.number,
);

const keyValueSchema = n.record(
    n.union(
        n.literal('foo'),
        n.literal('bar'),
    ).default('bar'),
    n.number,
);

describe('RecordSchema', () => {
    it('should normalize object keys and values', () => {
        const input = { foo: '1', bar: 2 };

        const valueOnlySchemaResult = valueOnlySchema.normalize(input);
        expect(valueOnlySchemaResult.data).toEqual({ foo: 1, bar: 2 });

        const keyValueSchemaResult = keyValueSchema.normalize(input);
        expect(keyValueSchemaResult.data).toEqual({ foo: 1, bar: 2 });
    });

    it('should convert non-object to object', () => {
        const result = keyValueSchema.normalize('baz');
        expect(result.data).toEqual({ bar: 0 });
    });
});

expectTypeOf(valueOnlySchema.normalize({ a: '1' })).toHaveProperty('data').toEqualTypeOf<Record<string, number>>();

expectTypeOf(keyValueSchema.normalize({ a: '1' })).toHaveProperty('data').toEqualTypeOf<Record<'foo' | 'bar', number>>();
