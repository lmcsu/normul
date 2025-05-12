# Normul

**Normul** is a tiny TypeScript/JavaScript library for fearless, predictable data normalization and transformation. No validation, no magic, just pure, explicit conversion of anything into the shape you want. Use it to make your data boringly consistent.

> **Normul is a data transformer and normalizer, not a validator.**
> Unlike Zod, Valibot, and similar libraries, Normul doesn't check if your data is "valid" — it just forcefully and predictably transforms whatever you give it into the shape you want. If something doesn't fit, Normul will do its best to convert it, not throw errors or stop your app.

---

## Why Normul?
- **No validation**: Normul doesn't judge your data, it just makes it fit.
- **Factory-first**: Everything is built via factories like `object`, `array`, `string`, `number`, etc.
- **Composable**: Mix, extend, preprocess, and postprocess schemas as you wish.
- **Zero surprises**: Always returns `{ data, issues }`, never throws.

---

## Install

```bash
pnpm add normul
```

---

## Quick Example

```ts
import * as n from 'normul';

const user = n.object({
  id: n.number,
  name: n.string,
  tags: n.array(n.string),
  meta: n.record(n.string),
  status: n.literal('active'),
});

const raw = {
  id: '42',
  name: null,
  tags: 'admin',
  meta: { foo: 1, bar: true },
  status: 'inactive',
};

const { data, issues } = user.normalize(raw);
console.log(data);
// {
//   id: 42,
//   name: '',
//   tags: ['admin'],
//   meta: { foo: '1', bar: 'true' },
//   status: 'active'
// }
console.log(issues); // [{ message: 'Normalized literal', ... }]
```

---

## Core Factories (the full toolbox)
- `n.string` — normalize to string
- `n.number` — normalize to number
- `n.boolean` — normalize to boolean
- `n.nullValue` — always null
- `n.undefinedValue` — always undefined
- `n.literal(value)` — always returns the fixed value
- `n.array(schema)` — array of normalized items (wraps non-arrays)
- `n.object({...})` — object with normalized fields
- `n.record(schema)` — object with arbitrary keys, values normalized
- `n.union(a, b, ...)` — tries schemas in order, picks the first that fits
- `n.tuple(a, b, ...)` — fixed-length arrays
- `n.discriminatedUnion(discriminator, ...schemas)` — smart union by field
- `n.any` — pass-through with `any` type
- `n.unknown` — pass-through with `unknown` type
- `n.type<T>()` — pass-through for advanced typing

---

## Power-Ups (chaining methods)
- `.default(value)` — fallback if value is null/undefined
- `.optional` — allow undefined
- `.nullable` — allow null
- `.preprocess(fn)` — run custom logic before normalization
- `.transform(fn)` — run custom logic after normalization
- `.strip` / `.passthrough` (for objects) — control extra keys
- `.extend({...})` (for objects) — add fields
- `.pick([...])` (for objects) — select fields
- `.omit([...])` (for objects) — exclude fields

---

## Real-World Example: Nested, Defaults, and More
```ts
import * as n from 'normul';

const post = n.object({
  title: n.string,
  views: n.number.default(0),
  tags: n.array(n.string).default([]),
});

const blog = n.object({
  posts: n.array(post),
  author: n.string.optional,
});

const input = {
  posts: [
    { title: 'Hello', views: '10' },
    { title: 123 },
  ],
};

const { data } = blog.normalize(input);
console.log(data);
// {
//   posts: [
//     { title: 'Hello', views: 10, tags: [] },
//     { title: '123', views: 0, tags: [] }
//   ],
//   author: undefined
// }
```

---

## Type Inference with n.Infer

Normul lets you extract the TypeScript type from a schema using the `n.Infer` utility:

```ts
import * as n from 'normul';

const user = n.object({
  id: n.number,
  name: n.string,
  tags: n.array(n.string),
});

// Extract the user type from the schema:
type User = n.Infer<typeof user>;
// User:
// {
//   id: number;
//   name: string;
//   tags: string[];
// }
```

---

## What you get
- **Predictable**: No exceptions, just normalized data and a list of what got changed.
- **Explicit**: You always know what happens to your data.
- **Fun**: Compose crazy schemas, preprocess, postprocess, and never worry about validation errors again.

---


## API Docs?
Read the source, Luke!
