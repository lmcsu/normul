import { describe, it, expect, expectTypeOf } from 'vitest';
import * as n from 'normul';

describe('Schema', () => {
    it('should support default()', () => {
        const schema = n.number.default(42);
        expect(schema.normalize(undefined).data).toBe(42);
        expect(schema.normalize(null).data).toBe(42);
    });

    it('should support fallback()', () => {
        const schema = n.number.fallback(42);
        expect(schema.normalize('foo').data).toBe(42);
    });

    it('should support optional()', () => {
        const schema = n.number.optional;
        expect(schema.normalize(undefined).data).toBeUndefined();
    });

    it('should support nullable()', () => {
        const schema = n.number.nullable;
        expect(schema.normalize(null).data).toBeNull();
    });

    it('should support preprocess()', () => {
        const schema = n.number.preprocess(x => (x as number) * 2);
        expect(schema.normalize(2).data).toBe(4);
    });

    it('should support transform()', () => {
        const schema = n.number.transform(x => x * 2);
        expect(schema.normalize(2).data).toBe(4);
    });

    it('should support type()', () => {
        const schema = n.number.type<string>();
        expectTypeOf(schema.normalize(1).data).toEqualTypeOf<string>();
    });
});
