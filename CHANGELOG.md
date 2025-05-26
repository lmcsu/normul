## Unreleased

- Refactor schema modifiers system to apply modifications directly on schema instances

- Add helper functions `isObject`, `isArray`, `isString`, `isNumber`, `isBoolean`

---

## v0.5.0 – 2025-05-19

- Introduce fallback method and FallbackSchema

- Enhance DiscriminatedUnionSchema types

- Add "warn" issue level and update issue messages

- Change ObjectSchema extend method to accept ObjectSchema instance or shape

---

## v0.4.0 – 2025-05-18

- Improve BooleanSchema and NumberSchema normalization logic

---

## v0.3.0 – 2025-05-12

- Support multiple element schemas in ArraySchema

- Add default fallback for UnionSchema when no variant matches

- Add `.partial` for RecordSchema

- `parse` has been renamed to `normalize` to emphasize data shaping and avoid confusion with validation libraries

- The record now accepts two schemas: `record(keySchema, valueSchema)`, or one schema for values: `record(valueSchema)`

---

## v0.2.0 – 2025-05-06

- Introduce **AnySchema** and **UnknownSchema**

- Add `ObjectSchema.omit(...)` method to exclude keys from object schemas

- Set `sideEffects: false` in `package.json` to enable better tree-shaking

- Preserve primitive types correctly in `Simplify` utility types

- Default generic parameter of `Schema<T>` to `unknown`

---

## v0.1.0 – 2025-05-04

- Initial release
