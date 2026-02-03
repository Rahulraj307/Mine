# TypeScript Complete Roadmap

> Based on [roadmap.sh/typescript](https://roadmap.sh/typescript) - Comprehensive TypeScript guide for Angular developers

---

## 📚 Table of Contents

1. [Introduction](#1-introduction)
2. [TypeScript vs JavaScript](#2-typescript-vs-javascript)
3. [TypeScript Types](#3-typescript-types)
4. [Type Inference](#4-type-inference)
5. [Type Compatibility](#5-type-compatibility)
6. [Combining Types](#6-combining-types)
7. [Type Guards](#7-type-guards)
8. [Functions](#8-functions)
9. [Interfaces](#9-interfaces)
10. [Classes](#10-classes)
11. [Generics](#11-generics)
12. [Utility Types](#12-utility-types)
13. [Advanced Types](#13-advanced-types)
14. [Modules](#14-modules)
15. [Decorators](#15-decorators)
16. [tsconfig.json](#16-tsconfigjson)
17. [References](#17-references)

---

## 1. Introduction

### What is TypeScript?
TypeScript is a **strongly typed superset of JavaScript** that compiles to plain JavaScript. Developed and maintained by Microsoft, it adds optional static typing and class-based object-oriented programming.

### Why TypeScript?
| Benefit | Description |
|---------|-------------|
| **Catch Errors Early** | Static type checking catches bugs at compile time |
| **Better IDE Support** | Autocomplete, refactoring, inline docs |
| **Self-Documenting** | Types serve as documentation |
| **Safer Refactoring** | Compiler catches breaking changes |
| **Modern Features** | Use latest JS features, compile to older ES |

### Installation & Setup
```bash
# Install globally
npm install -g typescript

# Check version
tsc --version

# Initialize project
tsc --init

# Compile TypeScript
tsc file.ts

# Watch mode
tsc --watch
```

---

## 2. TypeScript vs JavaScript

```javascript
// JavaScript - no type safety
function add(a, b) {
  return a + b;
}
add(5, "3"); // "53" - silent bug!
```

```typescript
// TypeScript - type safety
function add(a: number, b: number): number {
  return a + b;
}
add(5, "3"); // Error: Argument of type 'string' is not assignable
```

### Compilation Process
```
TypeScript (.ts) → TypeScript Compiler (tsc) → JavaScript (.js)
```

> **Key Point**: Types exist only at compile time. They are completely erased in the output JavaScript.

---

## 3. TypeScript Types

### Primitive Types

```typescript
// String
let name: string = "John";
let greeting: string = `Hello, ${name}`;

// Number (integers, floats, hex, binary, octal)
let age: number = 30;
let price: number = 19.99;
let hex: number = 0xf00d;
let binary: number = 0b1010;

// Boolean
let isActive: boolean = true;

// Null and Undefined
let nothing: null = null;
let notDefined: undefined = undefined;

// BigInt
let bigNumber: bigint = 100n;

// Symbol
let sym: symbol = Symbol("key");
```

### Object Types

```typescript
// Object type annotation
let user: { name: string; age: number };
user = { name: "John", age: 30 };

// Optional properties
let config: { host: string; port?: number };
config = { host: "localhost" }; // port is optional

// Readonly properties
let point: { readonly x: number; readonly y: number };
point = { x: 10, y: 20 };
// point.x = 15; // Error: Cannot assign to 'x' because it is a read-only property

// Index signatures
let dict: { [key: string]: number };
dict = { apples: 5, oranges: 3 };
```

### Array Types

```typescript
// Two syntaxes
let numbers: number[] = [1, 2, 3];
let strings: Array<string> = ["a", "b", "c"];

// Mixed array (tuple)
let tuple: [string, number] = ["John", 30];

// Readonly array
let readonlyArr: readonly number[] = [1, 2, 3];
// readonlyArr.push(4); // Error
```

### Special Types

```typescript
// any - disable type checking (avoid!)
let anything: any = "hello";
anything = 42;
anything.nonExistent(); // No error, but will crash at runtime

// unknown - safer alternative to any
let userInput: unknown = "hello";
// userInput.toUpperCase(); // Error: must narrow first
if (typeof userInput === "string") {
  userInput.toUpperCase(); // OK after type guard
}

// void - function returns nothing
function log(message: string): void {
  console.log(message);
}

// never - function never returns
function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}
```

---

## 4. Type Inference

TypeScript can automatically infer types when possible:

```typescript
// Inference from initialization
let name = "John";     // type: string
let age = 30;          // type: number
let active = true;     // type: boolean

// Array inference
let numbers = [1, 2, 3];           // type: number[]
let mixed = [1, "two"];            // type: (string | number)[]

// Object inference
let user = {
  name: "John",
  age: 30
};
// type: { name: string; age: number; }

// Function return inference
function add(a: number, b: number) {
  return a + b; // return type: number (inferred)
}

// Best practice: annotate function parameters, let return be inferred
```

---

## 5. Type Compatibility

TypeScript uses **structural typing** (duck typing):

```typescript
interface Point {
  x: number;
  y: number;
}

let point: Point = { x: 10, y: 20 };

// Compatible - has all required properties
let point3D = { x: 1, y: 2, z: 3 };
point = point3D; // OK - point3D has x and y

// Function compatibility
let greet: (name: string) => string;
greet = (n: string) => `Hello, ${n}`;
greet = (n: string, age: number) => `Hello`; // Error: too many params
```

---

## 6. Combining Types

### Union Types

```typescript
// Value can be one of several types
type ID = string | number;

function printId(id: ID) {
  // Must narrow before using type-specific operations
  if (typeof id === "string") {
    console.log(id.toUpperCase());
  } else {
    console.log(id.toFixed(2));
  }
}

printId("abc");
printId(123);

// Literal union types
type Status = "pending" | "approved" | "rejected";
type HttpCode = 200 | 400 | 404 | 500;
```

### Intersection Types

```typescript
// Combine multiple types into one
type Name = { firstName: string; lastName: string };
type Age = { age: number };

type Person = Name & Age;

const person: Person = {
  firstName: "John",
  lastName: "Doe",
  age: 30
};

// Interface extension equivalent
interface Employee extends Name, Age {
  department: string;
}
```

### keyof and typeof

```typescript
// typeof - get type from value
const config = {
  host: "localhost",
  port: 3000
};
type Config = typeof config;
// type Config = { host: string; port: number; }

// keyof - get union of keys
type ConfigKeys = keyof Config;
// type ConfigKeys = "host" | "port"

// Combined usage
function getValue<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

getValue(config, "host"); // type: string
getValue(config, "port"); // type: number
```

---

## 7. Type Guards

### typeof Guard

```typescript
function process(value: string | number) {
  if (typeof value === "string") {
    return value.toUpperCase(); // TypeScript knows it's string
  }
  return value.toFixed(2); // TypeScript knows it's number
}
```

### instanceof Guard

```typescript
class Dog {
  bark() { console.log("Woof!"); }
}

class Cat {
  meow() { console.log("Meow!"); }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark(); // TypeScript knows it's Dog
  } else {
    animal.meow(); // TypeScript knows it's Cat
  }
}
```

### in Operator

```typescript
interface Fish {
  swim(): void;
}

interface Bird {
  fly(): void;
}

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim();
  } else {
    animal.fly();
  }
}
```

### Custom Type Guards

```typescript
interface User {
  type: "user";
  name: string;
}

interface Admin {
  type: "admin";
  name: string;
  permissions: string[];
}

// Type predicate
function isAdmin(person: User | Admin): person is Admin {
  return person.type === "admin";
}

function showPermissions(person: User | Admin) {
  if (isAdmin(person)) {
    console.log(person.permissions); // TypeScript knows it's Admin
  }
}
```

---

## 8. Functions

### Function Types

```typescript
// Function type annotation
let greet: (name: string) => string;
greet = (name) => `Hello, ${name}`;

// Type alias for function
type MathOperation = (a: number, b: number) => number;
const add: MathOperation = (a, b) => a + b;
const multiply: MathOperation = (a, b) => a * b;

// Function with object parameter
function createUser({ name, age }: { name: string; age: number }) {
  return { name, age };
}
```

### Optional and Default Parameters

```typescript
// Optional parameter (must come last)
function greet(name: string, greeting?: string): string {
  return `${greeting || "Hello"}, ${name}`;
}

// Default parameter
function greet2(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}`;
}

// Rest parameters
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}
```

### Function Overloading

```typescript
// Overload signatures
function format(value: string): string;
function format(value: number): string;
function format(value: Date): string;

// Implementation signature (not visible to callers)
function format(value: string | number | Date): string {
  if (typeof value === "string") {
    return value.trim();
  } else if (typeof value === "number") {
    return value.toFixed(2);
  } else {
    return value.toISOString();
  }
}

format("hello");   // Returns string
format(123.456);   // Returns string
format(new Date()); // Returns string
```

---

## 9. Interfaces

### Interface Declaration

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;              // Optional
  readonly createdAt: Date;  // Cannot modify
}

const user: User = {
  id: 1,
  name: "John",
  email: "john@example.com",
  createdAt: new Date()
};
```

### Interface Extension

```typescript
interface Person {
  name: string;
  age: number;
}

interface Employee extends Person {
  employeeId: string;
  department: string;
}

// Multiple inheritance
interface Manager extends Employee {
  teamSize: number;
}

// Extend multiple interfaces
interface Contractor extends Person, Employee {
  contractDuration: number;
}
```

### Interface vs Type

```typescript
// Interfaces can be merged
interface User {
  name: string;
}
interface User {
  age: number;
}
// User now has both name and age

// Types cannot be merged
type UserType = { name: string };
// type UserType = { age: number }; // Error: Duplicate identifier

// Use interface for object shapes
// Use type for unions, primitives, and complex types
```

### Hybrid Types

```typescript
interface Counter {
  (start: number): number;  // Callable
  count: number;            // Property
  reset(): void;            // Method
}

function createCounter(): Counter {
  const counter = function(start: number) {
    counter.count = start;
    return counter.count;
  } as Counter;
  
  counter.count = 0;
  counter.reset = function() {
    counter.count = 0;
  };
  
  return counter;
}
```

---

## 10. Classes

### Basic Class

```typescript
class Person {
  // Properties
  name: string;
  age: number;
  
  // Constructor
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
  
  // Method
  greet(): string {
    return `Hello, I'm ${this.name}`;
  }
}

const person = new Person("John", 30);
```

### Access Modifiers

```typescript
class Employee {
  public name: string;       // Accessible everywhere (default)
  protected id: number;      // Accessible in class and subclasses
  private salary: number;    // Only accessible in this class
  readonly department: string; // Cannot be modified after initialization
  
  constructor(name: string, id: number, salary: number) {
    this.name = name;
    this.id = id;
    this.salary = salary;
    this.department = "Engineering";
  }
}

// Shorthand: parameter properties
class Employee2 {
  constructor(
    public name: string,
    protected id: number,
    private salary: number,
    readonly department: string = "Engineering"
  ) {}
}
```

### Private Fields (ES2022)

```typescript
class BankAccount {
  #balance: number = 0;  // True private (not just TypeScript)
  
  deposit(amount: number): void {
    this.#balance += amount;
  }
  
  getBalance(): number {
    return this.#balance;
  }
}

const account = new BankAccount();
// account.#balance; // Syntax Error
```

### Inheritance

```typescript
class Animal {
  constructor(public name: string) {}
  
  move(distance: number): void {
    console.log(`${this.name} moved ${distance}m`);
  }
}

class Dog extends Animal {
  constructor(name: string, public breed: string) {
    super(name);  // Call parent constructor
  }
  
  // Override method
  move(distance: number = 5): void {
    console.log("Running...");
    super.move(distance);  // Call parent method
  }
  
  bark(): void {
    console.log("Woof!");
  }
}
```

### Abstract Classes

```typescript
abstract class Shape {
  abstract getArea(): number;  // Must be implemented
  
  describe(): string {
    return `Area: ${this.getArea()}`;
  }
}

class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }
  
  getArea(): number {
    return Math.PI * this.radius ** 2;
  }
}

// const shape = new Shape(); // Error: Cannot instantiate abstract class
const circle = new Circle(5);
```

### Static Members

```typescript
class MathUtils {
  static PI = 3.14159;
  
  static add(a: number, b: number): number {
    return a + b;
  }
  
  static {
    // Static block (ES2022)
    console.log("MathUtils initialized");
  }
}

console.log(MathUtils.PI);
console.log(MathUtils.add(2, 3));
```

---

## 11. Generics

### Generic Functions

```typescript
// Without generics - loses type information
function identity(value: any): any {
  return value;
}

// With generics - preserves type
function identityGeneric<T>(value: T): T {
  return value;
}

const num = identityGeneric(42);       // type: number
const str = identityGeneric("hello");  // type: string

// Multiple type parameters
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}

const p = pair("name", "John");  // type: [string, string]
```

### Generic Constraints

```typescript
// T must have a length property
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(item: T): number {
  console.log(item.length);
  return item.length;
}

logLength("hello");     // OK - string has length
logLength([1, 2, 3]);   // OK - array has length
// logLength(123);      // Error - number has no length

// Constrain to object keys
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const person = { name: "John", age: 30 };
getProperty(person, "name");  // type: string
// getProperty(person, "email"); // Error
```

### Generic Classes

```typescript
class DataStore<T> {
  private items: T[] = [];
  
  add(item: T): void {
    this.items.push(item);
  }
  
  get(index: number): T {
    return this.items[index];
  }
  
  getAll(): T[] {
    return [...this.items];
  }
}

const stringStore = new DataStore<string>();
stringStore.add("hello");
const item = stringStore.get(0); // type: string

const userStore = new DataStore<{ name: string }>();
userStore.add({ name: "John" });
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
type UserResponse = ApiResponse<{ id: number; name: string }>;
type UsersListResponse = PaginatedResponse<{ id: number; name: string }>;
```

---

## 12. Utility Types

### Partial and Required

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

// All properties optional
type PartialUser = Partial<User>;
// { id?: number; name?: string; email?: string; age?: number; }

// All properties required
type RequiredUser = Required<User>;
// { id: number; name: string; email: string; age: number; }
```

### Pick and Omit

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// Select specific properties
type UserPreview = Pick<User, "id" | "name">;
// { id: number; name: string; }

// Exclude specific properties
type SafeUser = Omit<User, "password">;
// { id: number; name: string; email: string; }
```

### Readonly and Record

```typescript
// All properties readonly
type ReadonlyUser = Readonly<User>;

// Create object type with specific key/value types
type UserRoles = Record<string, "admin" | "user" | "guest">;
// { [key: string]: "admin" | "user" | "guest" }

// Specific keys
type PageInfo = Record<"home" | "about" | "contact", { title: string }>;
```

### ReturnType and Parameters

```typescript
function createUser(name: string, age: number): { name: string; age: number } {
  return { name, age };
}

// Get return type
type UserType = ReturnType<typeof createUser>;
// { name: string; age: number; }

// Get parameter types
type CreateUserParams = Parameters<typeof createUser>;
// [name: string, age: number]
```

### Exclude, Extract, NonNullable

```typescript
type Status = "pending" | "approved" | "rejected" | "cancelled";

// Remove types from union
type ActiveStatus = Exclude<Status, "cancelled">;
// "pending" | "approved" | "rejected"

// Keep only matching types
type FinalStatus = Extract<Status, "approved" | "rejected">;
// "approved" | "rejected"

// Remove null and undefined
type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>;
// string
```

---

## 13. Advanced Types

### Conditional Types

```typescript
// T extends U ? X : Y
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;   // true
type B = IsString<number>;   // false

// Infer keyword - extract types
type ElementType<T> = T extends (infer E)[] ? E : never;

type Numbers = ElementType<number[]>;  // number
type Strings = ElementType<string[]>;  // string

// Practical example: Unwrap Promise
type Awaited<T> = T extends Promise<infer U> ? U : T;

type Result = Awaited<Promise<string>>;  // string
```

### Mapped Types

```typescript
// Transform all properties
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

interface User {
  name: string;
  age: number;
}

type NullableUser = Nullable<User>;
// { name: string | null; age: number | null; }

// Make all properties optional
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

// Make all properties readonly
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Key remapping (TypeScript 4.1+)
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P];
};

type UserGetters = Getters<User>;
// { getName: () => string; getAge: () => number; }
```

### Template Literal Types

```typescript
// String manipulation
type Greeting = `Hello, ${string}`;
let g: Greeting = "Hello, World";  // OK

// Combining strings
type Color = "red" | "blue" | "green";
type Size = "sm" | "md" | "lg";
type ButtonClass = `btn-${Color}-${Size}`;
// "btn-red-sm" | "btn-red-md" | ... (9 combinations)

// With intrinsic string types
type UpperColor = Uppercase<Color>;      // "RED" | "BLUE" | "GREEN"
type LowerColor = Lowercase<UpperColor>; // "red" | "blue" | "green"
type CapColor = Capitalize<Color>;       // "Red" | "Blue" | "Green"
```

---

## 14. Modules

### ES Modules

```typescript
// Exporting (math.ts)
export const PI = 3.14159;
export function add(a: number, b: number): number {
  return a + b;
}
export class Calculator { }

// Default export
export default class User { }

// Type-only exports (removed during compilation)
export type { User };
export interface Config { }
```

```typescript
// Importing (app.ts)
import User from './user';                    // Default
import { PI, add, Calculator } from './math'; // Named
import { add as sum } from './math';          // Alias
import * as math from './math';               // Namespace
import type { User } from './user';           // Type-only

// Dynamic import
const module = await import('./math');
```

### Namespaces (Legacy)

```typescript
// Avoid for new code - use ES modules instead
namespace Validation {
  export function isEmail(value: string): boolean {
    return value.includes("@");
  }
}

Validation.isEmail("test@example.com");
```

### Declaration Files (.d.ts)

```typescript
// For libraries without types
// lodash.d.ts
declare module "lodash" {
  export function chunk<T>(array: T[], size: number): T[][];
  export function compact<T>(array: T[]): T[];
}

// Global declarations
declare global {
  interface Window {
    myLib: typeof import("./myLib");
  }
}
```

---

## 15. Decorators

> Note: Enable with `"experimentalDecorators": true` in tsconfig.json

### Class Decorator

```typescript
function Logger(target: Function) {
  console.log("Class created:", target.name);
}

@Logger
class User {
  constructor(public name: string) {}
}
```

### Decorator Factory

```typescript
function LogWithPrefix(prefix: string) {
  return function(target: Function) {
    console.log(`${prefix}: ${target.name}`);
  };
}

@LogWithPrefix("User Class")
class Person { }
```

### Method Decorator

```typescript
function Log(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    console.log(`Calling ${propertyKey} with:`, args);
    const result = original.apply(this, args);
    console.log(`Result:`, result);
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

### Property Decorator

```typescript
function Required(target: any, propertyKey: string) {
  // Mark property as required in metadata
  console.log(`${propertyKey} is marked as required`);
}

class Order {
  @Required
  customerId!: string;
}
```

---

## 16. tsconfig.json

### Essential Options

```json
{
  "compilerOptions": {
    // Type Checking
    "strict": true,                    // Enable all strict options
    "noImplicitAny": true,             // Error on implicit any
    "strictNullChecks": true,          // Null/undefined checking
    "strictFunctionTypes": true,       // Strict function type checking
    
    // Modules
    "module": "ESNext",                // Module system
    "moduleResolution": "bundler",     // How to resolve imports
    "esModuleInterop": true,           // CommonJS/ESM interop
    "resolveJsonModule": true,         // Import JSON files
    
    // Emit
    "target": "ES2022",                // JS version to emit
    "outDir": "./dist",                // Output directory
    "declaration": true,               // Generate .d.ts files
    "sourceMap": true,                 // Generate source maps
    
    // Path Mapping
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@components/*": ["components/*"]
    },
    
    // Other
    "skipLibCheck": true,              // Skip .d.ts checking
    "forceConsistentCasingInFileNames": true,
    "experimentalDecorators": true,    // Enable decorators
    "emitDecoratorMetadata": true      // Emit decorator metadata
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 17. References

### Official Resources
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [TypeScript GitHub](https://github.com/microsoft/TypeScript)

### roadmap.sh Resources
- [TypeScript Roadmap](https://roadmap.sh/typescript)
- [TypeScript Interview Questions](https://roadmap.sh/questions/typescript)

### Learning Resources
- [Total TypeScript](https://www.totaltypescript.com/) - Matt Pocock
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Type Challenges](https://github.com/type-challenges/type-challenges)

### Tools
- [ts-node](https://github.com/TypeStrong/ts-node) - Run TypeScript directly
- [tsx](https://github.com/esbuild-kit/tsx) - Fast TypeScript runner
- [dts-gen](https://github.com/microsoft/dts-gen) - Generate declarations

---

[🧭 Navigate](../NAVIGATION.md) | [📊 Track Progress](../PROGRESS.md) | [🏠 Home](../README.md)
