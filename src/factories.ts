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
    type ExtractShape,
    type Shape,
} from './schemas/index.js';

export const any = new AnySchema();

export function array<T extends [Schema, ...Schema[]]>(
    ...schemas: T
): ArraySchema<T> {
    return new ArraySchema(schemas);
}

export const boolean = new BooleanSchema();

export function discriminatedUnion<
    T extends [ObjectSchema<Shape>, ...ObjectSchema<Shape>[]],
    D extends Extract<keyof ExtractShape<T[number]>, string>,
>(
    discriminator: D,
    ...schemas: T
): DiscriminatedUnionSchema<T, D> {
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

export function record<V>(valueSchema: Schema<V>): RecordSchema<string, V>;
export function record<K extends string | number, V>(keySchema: Schema<K>, valueSchema: Schema<V>): RecordSchema<K, V>;
export function record<K extends string | number, V>(
    keyOrValue: Schema<K> | Schema<V>,
    valueMaybe?: Schema<V>,
): RecordSchema<K, V> | RecordSchema<string, V> {
    return valueMaybe ?
        new RecordSchema(keyOrValue as Schema<K>, valueMaybe) :
        new RecordSchema(new StringSchema(), keyOrValue as Schema<V>);
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
