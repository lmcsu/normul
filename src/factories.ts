import {
    AnySchema,
    ArraySchema,
    BooleanSchema,
    DiscriminatedUnionSchema,
    LiteralSchema,
    NullSchema,
    NumberSchema,
    ObjectSchema,
    RecordSchema,
    Schema,
    StringSchema,
    TupleSchema,
    TypeSchema,
    UndefinedSchema,
    UnionSchema,
    UnknownSchema,
    type Shape,
} from './schemas/index.js';

export const any = new AnySchema();

export function array<T>(schema: Schema<T>): ArraySchema<T> {
    return new ArraySchema(schema);
}

export const boolean = new BooleanSchema();

export function discriminatedUnion<T extends [Schema, ...Schema[]]>(
    discriminator: string,
    ...schemas: T
): DiscriminatedUnionSchema<T> {
    return new DiscriminatedUnionSchema(discriminator, schemas);
}

export function literal<T extends string | number | boolean>(value: T): LiteralSchema<T> {
    return new LiteralSchema(value);
}

export const nullValue = new NullSchema();

export const number = new NumberSchema();

export function object<T extends Shape>(shape: T): ObjectSchema<T> {
    return new ObjectSchema(shape);
}

export function record<V>(schema: Schema<V>): RecordSchema<V> {
    return new RecordSchema(schema);
}

export const string = new StringSchema();

export function tuple<T extends unknown[]>(
    ...schemas: { [K in keyof T]: Schema<T[K]> }
): TupleSchema<T> {
    return new TupleSchema<T>(schemas);
}

export function type<T>(): TypeSchema<T> {
    return new TypeSchema<T>();
}

export const undefinedValue = new UndefinedSchema();

export function union<T extends [Schema, ...Schema[]]>(
    ...schemas: T
): UnionSchema<T> {
    return new UnionSchema(schemas);
}

export const unknown = new UnknownSchema();
