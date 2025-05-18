import { describe, it, expect, expectTypeOf } from 'vitest';
import * as n from 'normul';

const schema = n.nullValue;

describe('NullSchema', () => {
    it('should return null regardless of input', () => {
        expect(schema.normalize(null).data).toBeNull();
        expect(schema.normalize(1).data).toBeNull();
        expect(schema.normalize('foo').data).toBeNull();
    });
});

expectTypeOf(schema.normalize('foo')).toHaveProperty('data').toBeNull();
