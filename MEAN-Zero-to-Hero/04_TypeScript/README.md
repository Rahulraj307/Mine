# 04 TypeScript: The Angular Bedrock

> **Goal**: Master Static Typing, Generics, and Advanced Types to write bulletproof Angular code.

---

## 1️⃣ Concept Explanation

### What is TypeScript?
It is a **superset** of JavaScript. This means valid JS is valid TS. It adds **Static Typing**, which allows you to catch errors at *compile time* (while writing code) rather than *runtime* (in the user's browser).

### Why use it?
- **Safety**: Stops `undefined` is not a function errors.
- **Documentation**: Types serve as "living documentation".
- **Refactoring**: Changing a property name updates it everywhere automatically.

---

## 2️⃣ Code Examples

### ❌ Bad Example ("Any" script)
```typescript
// Using 'any' disables TypeScript's power
function process(data: any) {
    return data.value; // Might crash if data is null
}
```

### ✅ Good Example (Strict Typing)
```typescript
interface User {
    id: number;
    name: string;
    role?: 'admin' | 'editor'; // Union Type + Optional
}

function getUserName(user: User): string {
    return user.name;
}
```

### Generics (Reusable logic)
Describing a relationship between input and output types.
```typescript
function wrapInArray<T>(item: T): T[] {
    return [item];
}

const numbers = wrapInArray(1); // numbers is number[]
const strings = wrapInArray("hello"); // strings is string[]
```

---

## 3️⃣ Internal Working: Transpilation

Browsers **cannot** run TypeScript.
1.  **Parsing**: TSC reads `.ts` code.
2.  **Type Checking**: Validates types against the configuration (`tsconfig.json`). If errors, it stops (usually).
3.  **Emission**: It removes all types and outputs pure `.js` code.

> **Key Takeaway**: TypeScript types **do not exist** at runtime. You cannot check `if (user instanceof UserInterface)` in the browser.

---

## 4️⃣ Common Mistakes

### 🚨 Beginner Mistakes
- Using `any` whenever confused (Use `unknown` instead).
- Not using `strict: true` in `tsconfig.json`.
- Confusing `interface` vs `class` (Interface = compile time, Class = runtime).

### ⚠️ Production Mistakes
- **Excessive Complexity**: Writing types so complex nobody understands them (`Conditional Types` hell).
- **Ignoring Nulls**: Trusting API responses without validation (use Zod/io-ts for runtime validation).
- **Enums**: Standard `enum` adds code to the bundle. Use `const enum` or Union Types instead.

---

## 5️⃣ Optimization & Best Practices

### Bundle Size
- **Const Enums**: Fully erased during compilation.
  ```typescript
  const enum Status { Active, Inactive } // Compiles to 0, 1
  ```
- **Type-Only Imports**:
  ```typescript
  import type { User } from './models'; // Guaranteed to be removed from bundle
  ```

### Architectures
- **Interface vs Type**:
  - Use `interface` for Objects/Classes (better performance, merges).
  - Use `type` for Unions, Primitives, Functions.

---

## 6️⃣ Interview QnA

### Beginner
**Q: Difference between `interface` and `class`?**
A: `class` creates a runtime object (you can `new` it). `interface` is purely for type checking and disappears in the JS output.

**Q: What is the `unknown` type?**
A: A type-safe version of `any`. You must check what it is (type narrowing) before using it.

### Intermediate
**Q: Explain `keyof` and `typeof`.**
A:
- `typeof`: Gets the type of a value (`const x = 10; type Num = typeof x;`).
- `keyof`: Gets a union of keys from a type (`interface P {x:1}; type Keys = keyof P; // "x"`).

### Scenario-Based
**Q: You have a library with no types. What do you do?**
A:
1.  Check for `@types/package-name`.
2.  Create a `global.d.ts` declaration file.
3.  Declare the module: `declare module 'package-name';`.

---

## 7️⃣ Web References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Total TypeScript (Matt Pocock)](https://www.totaltypescript.com/)
- [TS Playground](https://www.typescriptlang.org/play)
