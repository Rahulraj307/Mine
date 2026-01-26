# 📘 MASTER INTERVIEW Q&A: TypeScript (Zero to Hero)
> **Section 6: TypeScript (The Angular Bedrock – 2025)**
> From "What is a type?" to Generics, Utility Types, and Production Patterns.

---

## 🟢 Part 1: The Core (Types & Interfaces)

### 1️⃣ What is TypeScript? Why use it?
**Answer:**
TypeScript is a **superset of JavaScript** that adds **static typing**. Valid JS is valid TS.
*   **Compile-Time Safety:** Catch errors *before* runtime (`undefined is not a function` is gone).
*   **Better Tooling:** Autocomplete, refactoring, and inline documentation.
*   **Self-Documenting:** Types act as living documentation.

### 2️⃣ `type` vs `interface` (The Classic)
**Answer:**
| Feature | `interface` | `type` |
| :--- | :--- | :--- |
| **Extensibility** | Can be extended (`extends`) or merged (declaration merging) | Cannot merge, but can use `&` (Intersection) |
| **Use Case** | Objects, Classes | Unions, Primitives, Functions, Complex Types |
| **Performance** | Slightly better for large projects (caching) | Same |

**Rule of Thumb:** Use `interface` for objects, `type` for everything else.
```typescript
interface User { id: number; name: string; }
type Status = 'active' | 'inactive'; // Union Type
type ApiResponse<T> = { data: T; error: string | null }; // Generic Type
```

### 3️⃣ `any` vs `unknown` vs `never`
**Answer:**
*   **`any`**: Disables type checking. **Avoid.** ("AnyScript" is not TypeScript).
*   **`unknown`**: Type-safe `any`. You **must** narrow the type before using it.
*   **`never`**: Represents a value that never occurs (e.g., a function that always throws).

```typescript
function handleValue(val: unknown) {
  if (typeof val === 'string') {
    console.log(val.toUpperCase()); // ✅ Safe after type guard
  }
}

function fail(msg: string): never {
  throw new Error(msg); // This function never returns
}
```

### 4️⃣ Type Guards & Narrowing
**Answer:**
**Narrowing** is the process of refining a type to a more specific one.
*   **`typeof`**: For primitives (`string`, `number`).
*   **`instanceof`**: For classes.
*   **`in`**: Check if property exists.
*   **Custom Type Guard:** A function returning `x is Type`.

```typescript
interface Cat { meow(): void; }
interface Dog { bark(): void; }

function isCat(pet: Cat | Dog): pet is Cat {
  return (pet as Cat).meow !== undefined;
}
```

---

## 🟡 Part 2: Generics & Utility Types

### 5️⃣ What are Generics?
**Answer:**
Generics allow you to write reusable code that works with **any type** while maintaining type safety. Think of `<T>` as a **placeholder** for a type.
```typescript
function identity<T>(arg: T): T {
  return arg;
}
const num = identity(5);     // T is inferred as number
const str = identity("hi");  // T is inferred as string

// Generic Interface
interface ApiResponse<T> {
  data: T;
  status: number;
}
const userResponse: ApiResponse<User> = { data: { id: 1, name: 'Rahul' }, status: 200 };
```

### 6️⃣ Built-in Utility Types (Interview Gold 🔥)
**Answer:**
TypeScript provides helper types to transform existing types.
| Utility | Description | Example |
| :--- | :--- | :--- |
| `Partial<T>` | Makes all properties optional | `Partial<User>` |
| `Required<T>` | Makes all properties required | `Required<User>` |
| `Readonly<T>` | Makes all properties readonly | `Readonly<User>` |
| `Pick<T, K>` | Selects a subset of properties | `Pick<User, 'id' \| 'name'>` |
| `Omit<T, K>` | Removes a subset of properties | `Omit<User, 'password'>` |
| `Record<K, V>` | Creates an object type with keys K and values V | `Record<string, number>` |

```typescript
interface User { id: number; name: string; email: string; }

// For PATCH requests, all fields are optional
type UpdateUserDto = Partial<User>;

// For display, we don't need the email
type PublicUser = Omit<User, 'email'>;
```

### 7️⃣ `keyof` and `typeof`
**Answer:**
*   **`keyof`**: Gets a **union of keys** from a type.
*   **`typeof`**: Gets the **type of a value** (from JS variable to TS type).

```typescript
interface User { id: number; name: string; }
type UserKeys = keyof User; // "id" | "name"

const config = { apiUrl: 'https://...', timeout: 5000 };
type Config = typeof config; // { apiUrl: string; timeout: number; }
```

---

## 🔵 Part 3: Advanced Patterns

### 8️⃣ Discriminated Unions (Tagged Unions)
**Answer:**
A pattern for creating type-safe state machines or handling different response types.
```typescript
interface SuccessResponse { status: 'success'; data: User; }
interface ErrorResponse { status: 'error'; message: string; }
type ApiResponse = SuccessResponse | ErrorResponse;

function handle(res: ApiResponse) {
  if (res.status === 'success') {
    console.log(res.data); // TS knows 'data' exists here
  } else {
    console.log(res.message); // TS knows 'message' exists here
  }
}
```

### 9️⃣ Conditional Types
**Answer:**
Types that change based on a condition.
```typescript
type IsString<T> = T extends string ? 'yes' : 'no';
type A = IsString<string>; // 'yes'
type B = IsString<number>; // 'no'
```

### 🔟 `tsconfig.json` Key Options
**Answer:**
| Option | Recommendation | Why |
| :--- | :--- | :--- |
| `strict` | `true` | Enables all strict checks (nullChecks, noImplicitAny, etc.) |
| `noImplicitAny` | `true` | Errors if a type cannot be inferred |
| `strictNullChecks` | `true` | `null` and `undefined` are not assignable to other types |
| `esModuleInterop` | `true` | Allows `import x from 'cjs-module'` syntax |
| `skipLibCheck` | `true` | Speeds up compilation by not type-checking `node_modules` |

---

## 🔴 Part 4: Real-World & Gotchas

### 1️⃣1️⃣ Enums: Use or Avoid?
**Answer:**
Standard `enum` adds runtime code to your bundle.
**Prefer:**
1.  **`const enum`**: Fully inlined at compile time (no runtime overhead).
2.  **Union Types**: `type Status = 'active' | 'inactive';` (Most flexible, no runtime).

```typescript
// ❌ Standard Enum (adds code to bundle)
enum Status { Active, Inactive }

// ✅ Const Enum (erased at compile time)
const enum Status { Active, Inactive }

// ✅ Union Type (best for most cases)
type Status = 'active' | 'inactive';
```

### 1️⃣2️⃣ Type-Only Imports
**Answer:**
Ensures the import is only for type-checking and is **guaranteed to be removed** from the JS output.
```typescript
import type { User } from './models'; // Removed from bundle
```

### 1️⃣3️⃣ Working with External Libraries (No Types)
**Answer:**
1.  Check for `@types/package-name` on npm.
2.  If not found, create a `declarations.d.ts` file in your project:
    ```typescript
    declare module 'untyped-library';
    ```

---

## 🔥 Part 5: Rapid Fire (Senior Check)

*   **Can you use `instanceof` with an `interface`?**
    *   **No.** `interface` doesn't exist at runtime. Use a Type Guard function or a `class`.
*   **What is Declaration Merging?**
    *   If you declare two `interface User` in the same scope, TS merges them into one.
*   **What is the `infer` keyword?**
    *   Used in conditional types to extract a type. `type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;`
