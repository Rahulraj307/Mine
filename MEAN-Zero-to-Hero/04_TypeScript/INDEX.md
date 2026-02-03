# TypeScript - Topic Index

> Master static typing, generics, and advanced types for Angular development

---

## Topics

| File | Description | Status |
|------|-------------|--------|
| [README.md](./README.md) | Overview and quick reference | ⬜ |
| [theory.md](./theory.md) | Complete TypeScript guide | ⬜ |

---

## Core Concepts Covered

### Basic Types
- Primitives (string, number, boolean)
- Arrays and tuples
- Enums (regular and const)
- Any, unknown, void, never

### Interfaces & Types
- Object shape definitions
- Union and intersection types
- Type aliases vs interfaces
- Declaration merging

### Generics
- Generic functions and classes
- Constraints with `extends`
- Built-in generic types

### Utility Types
- Partial, Required, Pick, Omit
- Record, ReturnType, Parameters
- Exclude, Extract, NonNullable

### Advanced
- Type guards and narrowing
- Mapped types
- Conditional types
- Template literal types
- Decorators (experimental)

---

## Quick Reference

```typescript
// Interface
interface User {
  id: number;
  name: string;
  email?: string; // Optional
}

// Type alias for unions
type ID = string | number;

// Generic function
function wrap<T>(value: T): T[] {
  return [value];
}

// Utility types
type PartialUser = Partial<User>;
type UserPreview = Pick<User, "id" | "name">;
```

---

## Learning Path

1. ⬜ Basic types and type annotations
2. ⬜ Interfaces and type aliases
3. ⬜ Functions with types
4. ⬜ Generics fundamentals
5. ⬜ Utility types
6. ⬜ Type guards and narrowing
7. ⬜ Decorators (for Angular)

---

## Related Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Interview Q&A](../12_Interview_QnA/TypeScript_Master_QnA.md)

---

[🧭 Navigate](../NAVIGATION.md) | [📊 Track Progress](../PROGRESS.md)
