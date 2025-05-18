import { describe, it, expect, expectTypeOf } from 'vitest';
import * as n from 'normul';

const schema = n.literal('foo');

describe('LiteralSchema', () => {
    it('should return the literal value regardless of input', () => {
        expect(schema.normalize('foo').data).toBe('foo');
        expect(schema.normalize('bar').data).toBe('foo');
        expect(schema.normalize(123).data).toBe('foo');
    });
});

expectTypeOf(schema.normalize('x')).toHaveProperty('data').toEqualTypeOf<'foo'>();
