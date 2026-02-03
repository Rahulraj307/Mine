# TypeScript Fundamentals

> Complete guide to TypeScript for Angular developers

---

## Table of Contents
1. [Basic Types](#1-basic-types)
2. [Interfaces & Type Aliases](#2-interfaces--type-aliases)
3. [Generics](#3-generics)
4. [Utility Types](#4-utility-types)
5. [Decorators](#5-decorators)
6. [Advanced Patterns](#6-advanced-patterns)

---

## 1. Basic Types

### Primitive Types
```typescript
// String
let name: string = "John";

// Number (integers and floats)
let age: number = 30;
let price: number = 19.99;

// Boolean
let isActive: boolean = true;

// Arrays
let numbers: number[] = [1, 2, 3];
let names: Array<string> = ["John", "Jane"]; // Generic syntax

// Tuple - fixed length, fixed types
let user: [string, number] = ["John", 30];

// Enum
enum Status {
  Pending = "PENDING",
  Active = "ACTIVE",
  Completed = "COMPLETED"
}

// Any - avoid when possible!
let data: any = "can be anything";

// Unknown - safer than any
let input: unknown = getUserInput();
if (typeof input === "string") {
  console.log(input.toUpperCase()); // Type narrowed
}

// Void - function returns nothing
function logMessage(msg: string): void {
  console.log(msg);
}

// Never - function never returns
function throwError(msg: string): never {
  throw new Error(msg);
}

// Null and Undefined
let nothing: null = null;
let notDefined: undefined = undefined;
```

### Type Assertions
```typescript
// Tell TypeScript "trust me, I know the type"
const input = document.getElementById("username") as HTMLInputElement;
input.value = "Hello";

// Alternative syntax (not in JSX)
const input2 = <HTMLInputElement>document.getElementById("username");
```

---

## 2. Interfaces & Type Aliases

### Interface
```typescript
// Object shape definition
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;              // Optional property
  readonly createdAt: Date;  // Cannot be modified
}

// Function in interface
interface UserService {
  getUser(id: number): User;
  updateUser(user: User): void;
}

// Extending interfaces
interface Employee extends User {
  department: string;
  salary: number;
}

// Implementing interface
class UserImpl implements User {
  id = 1;
  name = "John";
  email = "john@example.com";
  readonly createdAt = new Date();
}
```

### Type Alias
```typescript
// For unions, primitives, tuples
type ID = string | number;
type Status = "pending" | "active" | "completed";
type Coordinates = [number, number];

// Object types (similar to interface)
type Point = {
  x: number;
  y: number;
};

// Function types
type Handler = (event: Event) => void;
type AsyncHandler = (id: number) => Promise<User>;

// Intersection types (combining types)
type Admin = User & {
  adminLevel: number;
  permissions: string[];
};
```

### Interface vs Type - When to Use
| Feature | Interface | Type |
|---------|-----------|------|
| Object shapes | ✅ Preferred | ✅ Works |
| Union types | ❌ | ✅ Required |
| Primitives | ❌ | ✅ Required |
| Declaration merging | ✅ Auto-merges | ❌ |
| Extends/Implements | ✅ | ✅ (with &) |

**Rule of thumb**: Use `interface` for objects/classes, `type` for everything else.

---

## 3. Generics

### Basic Generics
```typescript
// Generic function - works with any type
function identity<T>(value: T): T {
  return value;
}

const num = identity<number>(42);     // Explicit
const str = identity("hello");         // Inferred

// Generic with array
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

// Multiple type parameters
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}
```

### Generic Constraints
```typescript
// T must have a 'length' property
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(item: T): number {
  console.log(item.length);
  return item.length;
}

logLength("hello");     // ✅ string has length
logLength([1, 2, 3]);   // ✅ array has length
logLength(123);         // ❌ Error: number has no length
```

### Generic Classes
```typescript
class DataStore<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  get(index: number): T | undefined {
    return this.items[index];
  }

  getAll(): T[] {
    return [...this.items];
  }
}

const userStore = new DataStore<User>();
userStore.add({ id: 1, name: "John", email: "john@example.com" });
```

### Generic Interfaces
```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  totalPages: number;
  total: number;
}

// Usage
type UserResponse = ApiResponse<User>;
type UsersResponse = PaginatedResponse<User>;
```

---

## 4. Utility Types

### Built-in Utility Types
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// Partial<T> - All properties optional
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; password?: string; }

// Required<T> - All properties required
interface Config {
  host?: string;
  port?: number;
}
type RequiredConfig = Required<Config>;
// { host: string; port: number; }

// Pick<T, K> - Select specific properties
type UserPreview = Pick<User, "id" | "name">;
// { id: number; name: string; }

// Omit<T, K> - Exclude specific properties
type SafeUser = Omit<User, "password">;
// { id: number; name: string; email: string; }

// Readonly<T> - All properties readonly
type ImmutableUser = Readonly<User>;

// Record<K, T> - Object with keys K and values T
type UserRoles = Record<string, "admin" | "user" | "guest">;

// ReturnType<T> - Get function return type
function getUser() {
  return { id: 1, name: "John" };
}
type UserFromFn = ReturnType<typeof getUser>;
// { id: number; name: string; }

// Parameters<T> - Get function parameter types
type GetUserParams = Parameters<typeof getUser>;
// []

// Exclude<T, U> - Exclude types from union
type Status = "pending" | "active" | "completed" | "archived";
type ActiveStatus = Exclude<Status, "archived">;
// "pending" | "active" | "completed"

// Extract<T, U> - Extract matching types
type CompletedStatus = Extract<Status, "completed" | "archived">;
// "completed" | "archived"

// NonNullable<T> - Remove null and undefined
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>;
// string
```

---

## 5. Decorators

> Note: Decorators are experimental. Enable with `"experimentalDecorators": true` in tsconfig.json

### Class Decorator
```typescript
function Logger(target: Function) {
  console.log("Logging:", target.name);
}

@Logger
class Person {
  constructor(public name: string) {}
}
// Output: "Logging: Person"
```

### Decorator Factory (with parameters)
```typescript
function LoggerWithPrefix(prefix: string) {
  return function (target: Function) {
    console.log(`${prefix}: ${target.name}`);
  };
}

@LoggerWithPrefix("CLASS")
class Animal {
  constructor(public species: string) {}
}
// Output: "CLASS: Animal"
```

### Property Decorator
```typescript
function Required(target: any, propertyKey: string) {
  // Validation logic here
  console.log(`${propertyKey} is required`);
}

class Product {
  @Required
  name!: string;
}
```

### Method Decorator
```typescript
function Log(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${key} with args:`, args);
    const result = original.apply(this, args);
    console.log(`${key} returned:`, result);
    return result;
  };
  
  return descriptor;
}

class Calculator {
  @Log
  add(a: number, b: number): number {
    return a + b;
  }
}
```

---

## 6. Advanced Patterns

### Type Guards
```typescript
// typeof guard
function process(value: string | number) {
  if (typeof value === "string") {
    return value.toUpperCase(); // TypeScript knows it's string
  }
  return value * 2; // TypeScript knows it's number
}

// instanceof guard
class Dog {
  bark() { console.log("Woof!"); }
}

class Cat {
  meow() { console.log("Meow!"); }
}

function makeSound(pet: Dog | Cat) {
  if (pet instanceof Dog) {
    pet.bark();
  } else {
    pet.meow();
  }
}

// Custom type guard
interface Fish {
  swim(): void;
}

interface Bird {
  fly(): void;
}

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

function move(pet: Fish | Bird) {
  if (isFish(pet)) {
    pet.swim();
  } else {
    pet.fly();
  }
}
```

### Mapped Types
```typescript
// Create new type by transforming properties
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

interface User {
  name: string;
  age: number;
}

type NullableUser = Nullable<User>;
// { name: string | null; age: number | null; }

// Conditional types
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false
```

### Template Literal Types
```typescript
type Color = "red" | "green" | "blue";
type Size = "sm" | "md" | "lg";

type ButtonClass = `btn-${Color}-${Size}`;
// "btn-red-sm" | "btn-red-md" | "btn-red-lg" | "btn-green-sm" | ...

// Practical example
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type Endpoint = "/users" | "/tasks";

type ApiRoute = `${HttpMethod} ${Endpoint}`;
// "GET /users" | "GET /tasks" | "POST /users" | ...
```

---

## Common Interview Questions

### Q: What's the difference between `interface` and `type`?
**A**: `interface` is for object shapes and can be extended/merged. `type` is more flexible - supports unions, primitives, and computed types. Use `interface` for objects, `type` for everything else.

### Q: What is `unknown` vs `any`?
**A**: Both accept any value. `any` disables type checking entirely. `unknown` requires type narrowing before use - safer choice.

### Q: How do generics improve code?
**A**: They allow reusable code that works with multiple types while maintaining type safety. Instead of `any`, generics preserve type information.

### Q: What's a type guard?
**A**: A function or check that narrows a type. TypeScript then knows the specific type in that code branch.

### Q: Explain `keyof` and `typeof`
**A**: `keyof T` gets union of T's keys. `typeof variable` gets the type of a value. Combined: `keyof typeof obj` gets keys of object's type.

---

[🧭 Navigate](../NAVIGATION.md) | [📊 Track Progress](../PROGRESS.md) | [🏠 Home](../README.md)
