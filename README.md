# Normul 👍

**Normul** is a tiny TypeScript/JavaScript library for **fearless, predictable data normalization** and transformation. No validation exceptions, no magic, just pure, explicit conversion of anything into the shape you want. Use it to make your data boringly consistent.

> **Normul is a data transformer and normalizer, not a validator.**
> Unlike Zod, Valibot, and similar libraries, Normul doesn't check if your data is "valid" — it just forcefully and predictably transforms whatever you give it into the shape you want. If something doesn't fit, Normul will do its best to convert it, not throw errors or stop your app.

# 📚 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [🧠 Core Concepts](#-core-concepts)
  - [Schemas](#schemas)
  - [Normalization](#normalization)
  - [Issues](#issues)
- [🛠️ Schema Factories](#️-schema-factories)
  - [Primitive Schemas](#primitive-schemas)
    - [**string**](#string)
    - [**number**](#number)
    - [**boolean**](#boolean)
    - [**null**](#null)
    - [**undefined**](#undefined)
    - [**literal**](#literal)
  - [Structured Schemas](#structured-schemas)
    - [**object**](#object)
    - [**array**](#array)
    - [**record**](#record)
    - [**tuple**](#tuple)
  - [Union Schemas](#union-schemas)
    - [**union**](#union)
    - [**discriminatedUnion**](#discriminatedunion)
  - [Type Schemas](#type-schemas)
    - [**type**](#type)
    - [**any**](#any)
    - [**unknown**](#unknown)
- [⚙️ Schema Modifiers](#️-schema-modifiers)
  - [Value Modifiers](#value-modifiers)
    - [optional](#optional)
    - [nullable](#nullable)
    - [default](#default)
    - [fallback](#fallback)
  - [Transformations](#transformations)
    - [preprocess](#preprocess)
    - [transform](#transform)
  - [Object Schema Methods](#object-schema-methods)
    - [strip](#strip)
    - [passthrough](#passthrough)
    - [extend](#extend)
    - [pick](#pick)
    - [omit](#omit)
  - [Record Schema Methods](#record-schema-methods)
    - [partial](#partial)
- [🧰 Utils](#-utils)
  - [Type Guards](#type-guards)
  - [Type Inference](#type-inference)
- [💡 Examples](#-examples)
  - [API Response Normalization](#api-response-normalization)
  - [Form Data Processing](#form-data-processing)
  - [Config File Normalization](#config-file-normalization)
- [Why Normul Is Different](#why-normul-is-different)

# 🚀 Quick Start

```typescript
import * as n from "normul";

// Define your schema
const userSchema = n.object({
  id: n.number,
  name: n.string,
  isActive: n.boolean,
  tags: n.array(n.string),
});

// Process any data (even messy data!)
const messyData = {
  id: "42",       // string, not number
  name: null,     // null, not string
  isActive: 1,    // number, not boolean
  tags: "admin",  // string, not array
};

// Get normalized data
const { data } = userSchema.normalize(messyData);
console.log(data);
// {
//   id: 42,
//   name: "",
//   isActive: true,
//   tags: ["admin"],
// }

// TypeScript type inference: get the normalized data type
type User = n.Infer<typeof userSchema>;
// {
//   id: number;
//   name: string;
//   isActive: boolean;
//   tags: string[];
// }
```

# 📦 Installation

```bash
# Using npm
npm install normul

# Using yarn
yarn add normul

# Using pnpm
pnpm add normul
```

# 🧠 Core Concepts

## Schemas

Schemas are the building blocks of Normul.
The way schemas are built is almost the same as in many other libraries.
Each schema defines how a specific type of data should be normalized.

```typescript
// Create schemas using factory functions
const stringSchema = n.string;
const numberSchema = n.number;
const userSchema = n.object({
  name: n.string,
  age: n.number,
});
```

And of course, you can nest schemas as deeply as you want without any limitations

```typescript
const nestedSchema = n.object({
  nested: n.array(
    n.object({
      a: n.object({
        b: n.number.nullable,
      }),
    }),
    n.object({
      c: n.object({
        d: n.object({
          e: n.number.optional,
        }),
      }),
    }),
  ),
});

type Nested = n.Infer<typeof nestedSchema>;
// {
//   nested: ({
//     a: {
//       b: number | null;
//     };
//   } | {
//     c: {
//       d: {
//         e?: number;
//       };
//     };
//   })[];
// }
```

## Normalization

Normalization is the process of transforming input data to match a schema.
Unlike validation libraries that throw errors for mismatched data, Normul always tries to convert the data:

```typescript
// Normalizes anything to a string
const stringResult = n.string.normalize(42);
console.log(stringResult.data); // "42"

// Normalizes anything to a number
const numberResult = n.number.normalize("42.5");
console.log(numberResult.data); // 42.5
```

## Issues

When normalization involves type conversion or other transformations, Normul tracks these as "issues":

```typescript
const { data, issues } = n.string.normalize(42);
console.log(data); // "42"
console.log(issues);
// [
//   {
//     path: [],
//     message: "Converted to string",
//     level: "warn",
//     expected: "string",
//     received: 42,
//   }
// ]
```

Issue levels:
- `info`: Informational messages
- `warn`: Warnings about non-exact matches that were converted
- `error`: Errors that occurred during normalization

# 🛠️ Schema Factories

## Primitive Schemas

### **string**

Converts everything to string.

```typescript
// Converts primitives to their string equivalents
n.string.normalize(42).data          // "42"
n.string.normalize(true).data        // "true"

// Converts empty values to empty strings
n.string.normalize(undefined).data   // ""
n.string.normalize(null).data        // ""

// Converts objects/arrays to JSON
n.string.normalize([1, 2, 3]).data   // "[1,2,3]"
n.string.normalize({ a: 123 }).data  // '{"a":123}'

// Handles circular references gracefully
const a = {}; a.b = a;
n.string.normalize(a).data           // [object Object]
```

### **number**

Converts everything to number.

```typescript
// Converts primitives to their number equivalents
n.number.normalize("42").data        // 42
n.number.normalize(true).data        // 1

// Converts non-numbers and non-finite numbers to 0
n.number.normalize(null).data        // 0
n.number.normalize({ a: 123 }).data  // 0
n.number.normalize(NaN).data         // 0
n.number.normalize(Infinity).data    // 0
```

### **boolean**

Converts everything to boolean.

```typescript
// Converts common string representations to boolean
n.boolean.normalize("False").data    // false
n.boolean.normalize("0").data        // false
n.boolean.normalize("NO").data       // false
n.boolean.normalize("TRUE").data     // true
n.boolean.normalize("1").data        // true
n.boolean.normalize("yes").data      // true

// Converts falsy primitives to false
n.boolean.normalize(0).data          // false
n.boolean.normalize(null).data       // false
n.boolean.normalize(undefined).data  // false
n.boolean.normalize("").data         // false

// Converts truthy values to true
n.boolean.normalize(1).data          // true
n.boolean.normalize(-1).data         // true
n.boolean.normalize(" ").data        // true
n.boolean.normalize({}).data         // true
n.boolean.normalize([]).data         // true
```

### **null**

Converts everything to null.
Note: Due to JavaScript limitations, the schema is called `nullValue` instead of `null`.

```typescript
n.nullValue.normalize(anything).data // null
```

### **undefined**

Converts everything to undefined.
Note: Due to JavaScript limitations, the schema is called `undefinedValue` instead of `undefined`.

```typescript
n.undefinedValue.normalize(anything).data // undefined
```

### **literal**

Always returns the specified value.

```typescript
n.literal("active").normalize(anything).data // "active"
```

## Structured Schemas

### **object**

Transforms objects according to the specified schema.

```typescript
const userSchema = n.object({
  name: n.string,
  age: n.number,
});
userSchema.normalize({ name: "Alice", age: "30" }).data
// { name: "Alice", age: 30 }

// At least somehow tries to transform data so the type matches
userSchema.normalize("foo").data
// { name: "", age: 0 }
```

### **array**

Creates arrays of normalized elements.

```typescript
const tagsSchema = n.array(n.string);
tagsSchema.normalize(["admin", 123, true]).data
// ["admin", "123", "true"]

// Wraps single items in an array
tagsSchema.normalize("admin").data
// ["admin"]

// Array elements can have different schemas, in this case the most suitable one is selected or the first one
const numberOrStringArraySchema = n.array(n.string, n.number);
numberOrStringArraySchema.normalize(["foo", 123, true]).data
// ["foo", 123, "true"]

// TypeScript recognizes such schemas as union arrays
type NumberOrStringArray = n.Infer<typeof numberOrStringArraySchema>;
// (string | number)[]
```

### **record**

Creates record with string values from any object properties.

```typescript
const metadataSchema = n.record(n.string);
metadataSchema.normalize({ age: 42, active: true }).data
// { age: "42", active: "true" }

// You can also specify a schema for the key by passing two schemas, the first of which is the key
const numberRecordSchema = n.record(n.number, n.boolean);
numberRecordSchema.normalize({ "foo": 1 }).data
// { "0": true }

// TypeScript recognizes such schemas as records
type NumberRecord = n.Infer<typeof numberRecordSchema>;
// Record<number, boolean>
```

### **tuple**

Creates fixed-length array with different element types.

```typescript
const pointSchema = n.tuple(n.number, n.number, n.string);
pointSchema.normalize([1, "2", true]).data
// [1, 2, "true"]

// Wraps single items in an array and fills the rest
const stringTupleSchema = n.tuple(n.string, n.string);
stringTupleSchema.normalize("foo").data
// ["foo", ""]

// TypeScript recognizes such schemas as tuples
type Point = n.Infer<typeof pointSchema>;
// [number, number, string]
```

## Union Schemas

### **union**

Tries schemas in order, picks first that fits best.

```typescript
const flexibleId = n.union(n.number, n.string);
flexibleId.normalize(42).data           // 42
flexibleId.normalize("abc").data        // "abc"
```

### **discriminatedUnion**

Picks schema based on field value.

```typescript
const shapes = n.discriminatedUnion(
  "type",
  n.object({
    type: n.literal("circle"),
    radius: n.number
  }),
  n.object({
    type: n.literal("rectangle"),
    width: n.number,
    height: n.number
  })
);

shapes.normalize({
  type: "circle",
  radius: "5"
}).data
// { type: "circle", radius: 5 }
```

## Type Schemas

### **type**

Defines a schema for any custom TypeScript type. This does not perform any transformation by itself, but allows you to specify the output type explicitly.

```typescript
n.type<YourCustomType>().normalize(input).data
```

### **any**

Specifies the type as `any`. Equivalent to using `.type<any>()`.

```typescript
n.any.normalize(42).data  // 42 (typed as any)
```

### **unknown**

Specifies the type as `unknown`. Equivalent to using `.type<unknown>()`.

```typescript
n.unknown.normalize(42).data  // 42 (typed as unknown)
```

# ⚙️ Schema Modifiers

## Value Modifiers

### optional

Allows undefined values.
Note: This changes the schema type.

```typescript
const optionalName = n.string.optional;
optionalName.normalize(undefined).data  // undefined
```

### nullable

Allows null values.
Note: This changes the schema type.

```typescript
const nullableName = n.string.nullable;
nullableName.normalize(null).data  // null
```

### default

Provides default for `undefined`/`null`.

```typescript
const nameWithDefault = n.string.default("Anonymous");
nameWithDefault.normalize(null).data      // "Anonymous"
nameWithDefault.normalize(undefined).data // "Anonymous"
nameWithDefault.normalize("Bob").data     // "Bob"
```

### fallback

Provides value when normalization has issues.

```typescript
const safeName = n.string.fallback("Invalid");
safeName.normalize({ complex: "object" }).data  // "Invalid"
```

## Transformations

### preprocess

Modify input before schema processing.

```typescript
const trimmedString = n.string.preprocess((x) => {
  return n.isString(x) ? x.trim() : x;
});
trimmedString.normalize(" hello ").data  // "hello"
```

### transform

Convert after schema processing.
Note: This changes the schema type.

```typescript
const uppercaseName = n.string.transform(s => s.toUpperCase());
uppercaseName.normalize("alice").data  // "ALICE"
```

## Object Schema Methods

### strip

Removes unknown properties (default behavior)

### passthrough

Keeps unknown properties.

```typescript
const userSchema = n.object({
  name: n.string,
  age: n.number,
});

userSchema.passthrough.normalize({
  name: "Bob",
  age: 30,
  extra: true
}).data  // { name: "Bob", age: 30, extra: true }
```

### extend

Add more properties.

```typescript
const extendedUser = userSchema.extend({
  isActive: n.boolean
});

// You can also extend with another schema
const moreExtendedUser = extendedUser.extend(someOtherSchema);
```

### pick

Select specific properties.

```typescript
const nameOnly = userSchema.pick(["name"]);
```

### omit

Exclude specific properties.

```typescript
const withoutAge = userSchema.omit(["age"]);
```

## Record Schema Methods

### partial

Makes all record values optional.

```typescript
const partialMetadata = n.record(n.string).partial;
```

# 🧰 Utils

## Type Guards

Normul provides simple type-guard utilities for checking values.
These are especially useful when validating incoming data in preprocess functions.

- `n.isObject`
- `n.isArray`
- `n.isString`
- `n.isNumber`
- `n.isBoolean`

## Type Inference

You can extract the normalized TypeScript type from any schema using `n.Infer`:

```typescript
const User = n.Infer<typeof userSchema>;
```

# 💡 Examples

## API Response Normalization

```typescript
const apiResponseSchema = n.object({
  success: n.boolean,
  data: n.object({
    users: n.array(
      n.object({
        id: n.number,
        name: n.string,
        lastLogin: n.string.transform(date => new Date(date)),
      }),
    ),
    pagination: n.object({
      page: n.number,
      perPage: n.number,
      total: n.number,
    })
  }),
  message: n.string.optional,
});

// Even with inconsistent API responses, you'll get predictable data
const normalizedResponse = apiResponseSchema.normalize(apiResponse).data;
```

## Form Data Processing

```typescript
const formSchema = n.object({
  username: n.string.transform(s => s.trim()),
  age: n.number,
  newsletter: n.boolean,
});

// Process form data (which often comes as all strings)
const formData = {
  username: "  user123  ",
  age: "25",
  newsletter: "false",
};

const { data } = formSchema.normalize(formData);
// {
//   username: "user123",
//   age: 25,
//   newsletter: false,
// }
```

## Config File Normalization

```typescript
const configSchema = n.object({
  port: n.number.default(3000),
  host: n.string.default("localhost"),
  debug: n.boolean.default(false),
  database: n.object({
    url: n.string,
    maxConnections: n.number.default(10),
  }).nullable.default(null),
});

// Normalize partial config with sensible defaults
const { data: config } = configSchema.normalize({
  port: "8080"
});
// {
//   port: 8080,
//   host: "localhost",
//   debug: false,
//   database: null,
// }
```

---

# Why Normul Is Different

🙅‍♂️ **No Exceptions** - Normul never throws during normalization. You always get back `data` and `issues`.

🧰 **Swiss Army Knife** - Perfect for API responses, form data, configs, or anywhere with unpredictable data.

🔄 **Transformation-First** - Unlike validation libraries that check data, Normul actively transforms it.

🧘 **Minimalist Philosophy** - No complex validation rules or dependencies, just pure transformation.

---

*Normul: Turn messy data into boring, predictable data.*
