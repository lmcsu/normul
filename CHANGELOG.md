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
