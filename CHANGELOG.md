## Unreleased


### Changed

- Add "warn" issue level and update issue messages


---


## v0.4.0 – 2025-05-18


### Changed

- Improve BooleanSchema and NumberSchema normalization logic


---


## v0.3.0 – 2025-05-12


### Added

- Support multiple element schemas in ArraySchema

- Add default fallback for UnionSchema when no variant matches

- Add `.partial` for RecordSchema

### Changed

- `parse` has been renamed to `normalize` to emphasize data shaping and avoid confusion with validation libraries

- The record now accepts two schemas: `record(keySchema, valueSchema)`, or one schema for values: `record(valueSchema)`


---


## v0.2.0 – 2025-05-06


### Added

- Introduce **AnySchema** and **UnknownSchema**

- Add `ObjectSchema.omit(...)` method to exclude keys from object schemas

- Set `sideEffects: false` in `package.json` to enable better tree-shaking

### Fixed

- Preserve primitive types correctly in `Simplify` utility types

### Changed

- Default generic parameter of `Schema<T>` to `unknown`

### Docs

- Add section to README with example of using `n.Infer`


---


## v0.1.0 – 2025-05-04


### Added

- Initial release
