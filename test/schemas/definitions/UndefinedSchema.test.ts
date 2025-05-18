import { describe, it, expect, expectTypeOf } from 'vitest';
import * as n from 'normul';

const schema = n.undefinedValue;

describe('UndefinedSchema', () => {
    it('should return undefined regardless of input', () => {
        expect(schema.normalize(null).data).toBeUndefined();
        expect(schema.normalize(1).data).toBeUndefined();
        expect(schema.normalize('foo').data).toBeUndefined();
    });
});

expectTypeOf(schema.normalize('foo')).toHaveProperty('data').toBeUndefined();
