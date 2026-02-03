# JavaScript Complete Roadmap

> Based on [roadmap.sh/javascript](https://roadmap.sh/javascript) - A comprehensive guide from basics to advanced

---

## 📚 Table of Contents

1. [Introduction](#1-introduction)
2. [Variables & Data Types](#2-variables--data-types)
3. [Type Casting](#3-type-casting)
4. [Data Structures](#4-data-structures)
5. [Equality Comparisons](#5-equality-comparisons)
6. [Loops & Iterations](#6-loops--iterations)
7. [Control Flow](#7-control-flow)
8. [Expressions & Operators](#8-expressions--operators)
9. [Functions](#9-functions)
10. [Strict Mode](#10-strict-mode)
11. [This Keyword](#11-this-keyword)
12. [Asynchronous JavaScript](#12-asynchronous-javascript)
13. [Classes](#13-classes)
14. [Iterators & Generators](#14-iterators--generators)
15. [Modules](#15-modules)
16. [Memory Management](#16-memory-management)
17. [DOM APIs](#17-dom-apis)
18. [References](#18-references)

---

## 1. Introduction

### What is JavaScript?
JavaScript is a dynamic, interpreted programming language primarily used for web development. It's the only programming language natively understood by web browsers.

### JavaScript Versions
| Version | Year | Key Features |
|---------|------|--------------|
| ES5 | 2009 | Strict mode, JSON, Array methods |
| ES6/ES2015 | 2015 | let/const, arrow functions, classes, modules, promises |
| ES2016 | 2016 | Array.includes(), exponentiation operator |
| ES2017 | 2017 | async/await, Object.entries/values |
| ES2018 | 2018 | Rest/spread properties, async iteration |
| ES2019 | 2019 | Array.flat(), Object.fromEntries() |
| ES2020 | 2020 | Optional chaining, nullish coalescing, BigInt |
| ES2021 | 2021 | String.replaceAll(), Promise.any() |
| ES2022 | 2022 | Top-level await, private class fields |
| ES2023 | 2023 | Array.findLast(), hashbang grammar |

### How to Run JavaScript
```javascript
// 1. Browser Console (F12 → Console)
console.log("Hello from browser!");

// 2. Node.js
// node script.js

// 3. HTML Script Tag
// <script src="app.js"></script>
```

---

## 2. Variables & Data Types

### Variable Declarations

```javascript
// var - function scoped, hoisted, can be redeclared
var name = "John";
var name = "Jane"; // OK

// let - block scoped, hoisted (TDZ), cannot redeclare
let age = 25;
// let age = 30; // Error: already declared

// const - block scoped, cannot reassign primitive
const PI = 3.14159;
// PI = 3; // Error: Assignment to constant

// BUT! const objects can be mutated
const user = { name: "John" };
user.name = "Jane"; // OK - mutating property
// user = {}; // Error - reassigning variable
```

### Primitive Data Types

```javascript
// 1. String
let str = "Hello World";
let template = `Count: ${1 + 1}`; // Template literal

// 2. Number (both integers and floats)
let integer = 42;
let float = 3.14;
let infinity = Infinity;
let notANumber = NaN;

// 3. BigInt (for very large numbers)
let bigNum = 9007199254740991n;
let bigNum2 = BigInt("9007199254740991");

// 4. Boolean
let isActive = true;
let isDeleted = false;

// 5. Undefined (declared but not assigned)
let x;
console.log(x); // undefined

// 6. Null (intentional absence of value)
let empty = null;

// 7. Symbol (unique identifier)
let sym1 = Symbol("id");
let sym2 = Symbol("id");
console.log(sym1 === sym2); // false - always unique
```

### typeof Operator

```javascript
typeof "hello"      // "string"
typeof 42           // "number"
typeof 42n          // "bigint"
typeof true         // "boolean"
typeof undefined    // "undefined"
typeof null         // "object" (historical bug!)
typeof Symbol("x")  // "symbol"
typeof {}           // "object"
typeof []           // "object" (arrays are objects)
typeof function(){} // "function"
```

---

## 3. Type Casting

### Implicit Coercion (Automatic)

```javascript
// String coercion
"5" + 3       // "53" (number to string)
"5" + true    // "5true"

// Number coercion
"5" - 3       // 2 (string to number)
"5" * "2"     // 10
true + true   // 2 (true = 1, false = 0)

// Boolean coercion
if ("hello")  // truthy
if ("")       // falsy
if (0)        // falsy
if (null)     // falsy
```

### Explicit Type Conversion

```javascript
// To String
String(123)           // "123"
(123).toString()      // "123"
123 + ""              // "123"

// To Number
Number("42")          // 42
Number("42px")        // NaN
parseInt("42px")      // 42 (parses until non-digit)
parseFloat("3.14")    // 3.14
+"42"                 // 42 (unary plus)

// To Boolean
Boolean(1)            // true
Boolean(0)            // false
Boolean("")           // false
Boolean("hello")      // true
!!value               // Double NOT coercion
```

### Truthy and Falsy Values

```javascript
// FALSY values (evaluate to false)
false
0, -0
"", '', ``            // empty strings
null
undefined
NaN

// Everything else is TRUTHY
true
1, -1, 3.14
"hello", "false", "0" // non-empty strings
[], {}                // empty array/object are truthy!
function() {}
```

---

## 4. Data Structures

### Objects

```javascript
// Object creation
const person = {
  name: "John",
  age: 30,
  greet() {
    return `Hello, I'm ${this.name}`;
  }
};

// Accessing properties
person.name           // "John" - dot notation
person["age"]         // 30 - bracket notation

// Property shorthand
const name = "Jane";
const user = { name }; // { name: "Jane" }

// Computed property names
const key = "email";
const obj = { [key]: "test@example.com" };

// Object methods
Object.keys(person)    // ["name", "age", "greet"]
Object.values(person)  // ["John", 30, ƒ]
Object.entries(person) // [["name", "John"], ["age", 30], ...]
Object.assign({}, a, b) // Merge objects
{ ...a, ...b }         // Spread merge
```

### Arrays

```javascript
// Creation
const arr = [1, 2, 3];
const arr2 = new Array(5); // [empty × 5]

// Common methods
arr.push(4)           // Add to end → [1, 2, 3, 4]
arr.pop()             // Remove from end → 4
arr.unshift(0)        // Add to start → [0, 1, 2, 3]
arr.shift()           // Remove from start → 0

// Transformation (return new array)
arr.map(x => x * 2)       // [2, 4, 6]
arr.filter(x => x > 1)    // [2, 3]
arr.reduce((sum, x) => sum + x, 0) // 6

// Searching
arr.find(x => x > 1)      // 2 (first match)
arr.findIndex(x => x > 1) // 1 (index of first match)
arr.includes(2)           // true
arr.indexOf(2)            // 1

// Other useful methods
arr.slice(1, 3)       // [2, 3] (copy portion)
arr.splice(1, 1)      // Removes element at index 1
arr.concat([4, 5])    // [1, 2, 3, 4, 5]
arr.join("-")         // "1-2-3"
arr.reverse()         // [3, 2, 1]
arr.sort((a,b) => a-b) // Numeric sort

// ES2023+
arr.findLast(x => x > 1)      // 3
arr.findLastIndex(x => x > 1) // 2
arr.toSorted()        // Returns new sorted array
arr.toReversed()      // Returns new reversed array
```

### Map and Set

```javascript
// Map - key-value pairs (any type as key)
const map = new Map();
map.set("name", "John");
map.set(1, "one");
map.set({id: 1}, "object key");

map.get("name")       // "John"
map.has(1)            // true
map.delete("name")
map.size              // 2

// Set - unique values
const set = new Set([1, 2, 2, 3]);
console.log(set)      // Set {1, 2, 3}

set.add(4);
set.has(2);           // true
set.delete(2);
set.size;             // 3

// Convert to array
[...set]              // [1, 3, 4]
```

### WeakMap and WeakSet

```javascript
// WeakMap - keys must be objects, garbage collected
const wm = new WeakMap();
let obj = { data: "value" };
wm.set(obj, "metadata");
obj = null; // Now the entry can be garbage collected

// WeakSet - values must be objects
const ws = new WeakSet();
ws.add({ id: 1 });
```

---

## 5. Equality Comparisons

### == vs ===

```javascript
// == (loose equality) - performs type coercion
5 == "5"        // true (string converted to number)
0 == false      // true
null == undefined // true

// === (strict equality) - no type coercion
5 === "5"       // false (different types)
0 === false     // false
null === undefined // false

// ALWAYS prefer === unless you specifically need coercion
```

### Object.is()

```javascript
// Object.is - like === but handles edge cases
Object.is(NaN, NaN)     // true (unlike ===)
Object.is(0, -0)        // false (unlike ===)
Object.is(5, 5)         // true
```

---

## 6. Loops & Iterations

```javascript
const arr = [1, 2, 3];
const obj = { a: 1, b: 2 };

// for loop
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}

// for...of (iterate values - arrays, strings, iterables)
for (const value of arr) {
  console.log(value); // 1, 2, 3
}

// for...in (iterate keys - objects)
for (const key in obj) {
  console.log(key, obj[key]); // "a" 1, "b" 2
}

// while
let i = 0;
while (i < 3) {
  console.log(i++);
}

// do...while (runs at least once)
do {
  console.log(i--);
} while (i > 0);

// forEach (no return value, cannot break)
arr.forEach((value, index) => {
  console.log(index, value);
});

// Array methods for iteration
arr.map(x => x * 2);      // Transform each
arr.filter(x => x > 1);   // Keep matching
arr.some(x => x > 2);     // Any match? true
arr.every(x => x > 0);    // All match? true
```

---

## 7. Control Flow

```javascript
// if...else
if (condition) {
  // code
} else if (anotherCondition) {
  // code
} else {
  // code
}

// Ternary operator
const result = condition ? "yes" : "no";

// switch
switch (value) {
  case 1:
    console.log("one");
    break;
  case 2:
  case 3:
    console.log("two or three");
    break;
  default:
    console.log("other");
}

// Error handling
try {
  throw new Error("Something went wrong");
} catch (error) {
  console.error(error.message);
} finally {
  // Always runs
}
```

---

## 8. Expressions & Operators

### Arithmetic Operators

```javascript
5 + 3   // 8  Addition
5 - 3   // 2  Subtraction
5 * 3   // 15 Multiplication
5 / 3   // 1.666... Division
5 % 3   // 2  Remainder
5 ** 3  // 125 Exponentiation
++x     // Pre-increment
x++     // Post-increment
```

### Logical Operators

```javascript
// AND - returns first falsy or last value
true && "hello"   // "hello"
false && "hello"  // false

// OR - returns first truthy or last value
false || "hello"  // "hello"
"hi" || "hello"   // "hi"

// NOT
!true             // false
!!value           // Convert to boolean

// Nullish coalescing (ES2020)
null ?? "default" // "default"
0 ?? "default"    // 0 (0 is not null/undefined)

// Optional chaining (ES2020)
user?.address?.street  // undefined if any is null/undefined
user?.getName?.()      // Safe method call
arr?.[0]               // Safe array access
```

### Spread and Rest

```javascript
// Spread - expand iterable
const arr1 = [1, 2];
const arr2 = [...arr1, 3, 4]; // [1, 2, 3, 4]
const obj2 = { ...obj1, newProp: "value" };

// Rest - collect into array
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3); // 6

// Destructuring with rest
const [first, ...rest] = [1, 2, 3]; // first=1, rest=[2,3]
const { name, ...other } = user;
```

---

## 9. Functions

### Function Types

```javascript
// Function declaration (hoisted)
function greet(name) {
  return `Hello, ${name}`;
}

// Function expression
const greet2 = function(name) {
  return `Hello, ${name}`;
};

// Arrow function (ES6)
const greet3 = (name) => `Hello, ${name}`;

// Arrow function quirks
// - No own 'this' (inherits from parent)
// - No 'arguments' object
// - Cannot be used as constructor

// IIFE (Immediately Invoked Function Expression)
(function() {
  console.log("Runs immediately");
})();
```

### Parameters

```javascript
// Default parameters
function greet(name = "Guest") {
  return `Hello, ${name}`;
}

// Rest parameters
function sum(...nums) {
  return nums.reduce((a, b) => a + b, 0);
}

// Destructuring parameters
function createUser({ name, age = 18 }) {
  return { name, age };
}
createUser({ name: "John" });
```

### Closures

```javascript
function createCounter() {
  let count = 0; // Private variable
  
  return {
    increment() { return ++count; },
    decrement() { return --count; },
    getCount() { return count; }
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.getCount();  // 2
```

### Higher-Order Functions

```javascript
// Function that takes function as argument
function withLogging(fn) {
  return function(...args) {
    console.log("Calling with:", args);
    const result = fn(...args);
    console.log("Result:", result);
    return result;
  };
}

const add = (a, b) => a + b;
const loggedAdd = withLogging(add);
loggedAdd(2, 3); // Logs: Calling with: [2, 3], Result: 5
```

---

## 10. Strict Mode

```javascript
"use strict";

// Benefits:
// 1. Prevents accidental globals
x = 10; // Error: x is not defined

// 2. Makes assignments fail loudly
const obj = {};
Object.defineProperty(obj, "x", { value: 1, writable: false });
obj.x = 2; // Error in strict mode

// 3. Prevents deleting undeletable
delete Object.prototype; // Error

// 4. No duplicate parameter names
function f(a, a) {} // Error
```

---

## 11. This Keyword

```javascript
// 1. Global context
console.log(this); // Window (browser) or global (Node)

// 2. Object method - this = object
const obj = {
  name: "John",
  greet() {
    console.log(this.name); // "John"
  }
};

// 3. Regular function - this = undefined (strict) or global
function regularFn() {
  console.log(this); // undefined in strict mode
}

// 4. Arrow function - inherits from parent scope
const obj2 = {
  name: "Jane",
  greet: () => {
    console.log(this.name); // undefined! (inherits from outer scope)
  },
  greetProperly() {
    const arrow = () => console.log(this.name);
    arrow(); // "Jane" - inherits from greetProperly
  }
};

// 5. Explicit binding
function sayHello() {
  console.log(`Hello, ${this.name}`);
}

const user = { name: "Bob" };
sayHello.call(user);    // "Hello, Bob"
sayHello.apply(user);   // "Hello, Bob"  
const bound = sayHello.bind(user);
bound();                // "Hello, Bob"

// 6. Constructor - this = new instance
function Person(name) {
  this.name = name;
}
const p = new Person("Alice"); // this = new Person instance
```

---

## 12. Asynchronous JavaScript

### Callbacks

```javascript
function fetchData(callback) {
  setTimeout(() => {
    callback(null, { data: "result" });
  }, 1000);
}

fetchData((error, data) => {
  if (error) console.error(error);
  else console.log(data);
});

// Callback hell (pyramid of doom)
getData((data) => {
  processData(data, (processed) => {
    saveData(processed, (saved) => {
      // Deeply nested...
    });
  });
});
```

### Promises

```javascript
// Creating a promise
const promise = new Promise((resolve, reject) => {
  const success = true;
  if (success) {
    resolve("Data loaded");
  } else {
    reject(new Error("Failed to load"));
  }
});

// Consuming promises
promise
  .then(data => console.log(data))
  .catch(error => console.error(error))
  .finally(() => console.log("Done"));

// Promise methods
Promise.all([p1, p2, p3])    // All must resolve
Promise.allSettled([p1, p2]) // Wait for all (fulfilled or rejected)
Promise.race([p1, p2])       // First to settle wins
Promise.any([p1, p2])        // First to fulfill wins

// Chaining
fetch("/api/user")
  .then(res => res.json())
  .then(user => fetch(`/api/posts/${user.id}`))
  .then(res => res.json())
  .then(posts => console.log(posts));
```

### Async/Await

```javascript
// Async function always returns a promise
async function fetchUser() {
  const response = await fetch("/api/user");
  const user = await response.json();
  return user;
}

// Error handling
async function getData() {
  try {
    const data = await fetch("/api/data");
    return await data.json();
  } catch (error) {
    console.error("Fetch failed:", error);
    throw error;
  } finally {
    console.log("Cleanup");
  }
}

// Parallel execution
async function fetchAll() {
  const [users, posts] = await Promise.all([
    fetch("/api/users").then(r => r.json()),
    fetch("/api/posts").then(r => r.json())
  ]);
  return { users, posts };
}
```

### Event Loop

```javascript
console.log("1"); // Synchronous

setTimeout(() => console.log("2"), 0); // Macrotask

Promise.resolve().then(() => console.log("3")); // Microtask

console.log("4"); // Synchronous

// Output: 1, 4, 3, 2
// Why? Microtasks run before macrotasks
```

---

## 13. Classes

```javascript
class Animal {
  // Private field (ES2022)
  #secret = "hidden";
  
  // Static property
  static kingdom = "Animalia";
  
  // Constructor
  constructor(name) {
    this.name = name;
  }
  
  // Instance method
  speak() {
    console.log(`${this.name} makes a sound`);
  }
  
  // Getter
  get info() {
    return `Animal: ${this.name}`;
  }
  
  // Setter
  set nickname(value) {
    this.name = value;
  }
  
  // Static method
  static create(name) {
    return new Animal(name);
  }
  
  // Private method
  #privateMethod() {
    return this.#secret;
  }
}

// Inheritance
class Dog extends Animal {
  constructor(name, breed) {
    super(name); // Call parent constructor
    this.breed = breed;
  }
  
  speak() {
    console.log(`${this.name} barks`);
  }
}

const dog = new Dog("Rex", "German Shepherd");
dog.speak(); // "Rex barks"
```

---

## 14. Iterators & Generators

```javascript
// Iterator protocol
const iterable = {
  [Symbol.iterator]() {
    let step = 0;
    return {
      next() {
        step++;
        if (step <= 3) return { value: step, done: false };
        return { done: true };
      }
    };
  }
};

for (const value of iterable) {
  console.log(value); // 1, 2, 3
}

// Generator function
function* numberGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = numberGenerator();
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: false }
gen.next(); // { value: undefined, done: true }

// Async generator
async function* asyncGenerator() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
}
```

---

## 15. Modules

### ES Modules (ESM)

```javascript
// Named exports (math.js)
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export class Calculator { }

// Named imports
import { PI, add, Calculator } from './math.js';

// Import with alias
import { add as sum } from './math.js';

// Default export (one per module)
export default class User { }

// Default import
import User from './user.js';

// Mixed
import User, { helper } from './user.js';

// Import all
import * as math from './math.js';
math.add(1, 2);

// Dynamic import
const module = await import('./math.js');
```

### CommonJS (Node.js)

```javascript
// Exporting
module.exports = { add, PI };
// or
exports.add = add;

// Importing
const { add, PI } = require('./math');
```

---

## 16. Memory Management

### Garbage Collection

```javascript
// Objects are garbage collected when unreachable
let user = { name: "John" };
user = null; // Original object can now be collected

// Closures can prevent GC
function createHandler() {
  const largeData = new Array(1000000);
  return () => {
    // largeData is retained as long as handler exists
  };
}

// WeakMap/WeakSet allow GC
const cache = new WeakMap();
let obj = { data: "value" };
cache.set(obj, "cached");
obj = null; // Cache entry can be collected
```

### Memory Leaks

```javascript
// Common causes:
// 1. Global variables
window.leaky = { huge: "data" };

// 2. Forgotten timers
setInterval(() => { /* uses outer scope */ }, 1000);

// 3. Removed DOM with references
const elements = [];
document.querySelectorAll('.item').forEach(el => {
  elements.push(el); // Keeps reference after removal
});

// 4. Event listeners not removed
element.addEventListener('click', handler);
// Must remove: element.removeEventListener('click', handler);
```

---

## 17. DOM APIs

### Selecting Elements

```javascript
document.getElementById("id");
document.querySelector(".class");
document.querySelectorAll("div");
document.getElementsByClassName("class");
document.getElementsByTagName("div");
```

### Manipulating Elements

```javascript
// Content
element.textContent = "Text";
element.innerHTML = "<b>HTML</b>";

// Attributes
element.getAttribute("href");
element.setAttribute("href", "/new");
element.removeAttribute("disabled");
element.dataset.userId; // data-user-id attribute

// Classes
element.classList.add("active");
element.classList.remove("active");
element.classList.toggle("active");
element.classList.contains("active");

// Styles
element.style.color = "red";
element.style.backgroundColor = "blue";
```

### Events

```javascript
// Adding listeners
element.addEventListener("click", (e) => {
  e.preventDefault();  // Prevent default behavior
  e.stopPropagation(); // Stop bubbling
});

// Event delegation
document.addEventListener("click", (e) => {
  if (e.target.matches(".button")) {
    handleButtonClick(e.target);
  }
});

// Custom events
const event = new CustomEvent("myEvent", { detail: { data: "value" } });
element.dispatchEvent(event);
```

---

## 18. References

### Official Documentation
- [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [ECMAScript Specification](https://tc39.es/ecma262/)
- [JavaScript.info](https://javascript.info/)

### roadmap.sh Resources
- [JavaScript Roadmap](https://roadmap.sh/javascript)
- [JavaScript Interview Questions](https://roadmap.sh/questions/javascript)
- [JavaScript Coding Interview](https://roadmap.sh/questions/javascript-coding)

### Tools
- [ESLint](https://eslint.org/) - Linting
- [Prettier](https://prettier.io/) - Formatting
- [Babel](https://babeljs.io/) - Transpiling
- [TypeScript](https://www.typescriptlang.org/) - Type safety

---

[🧭 Navigate](../NAVIGATION.md) | [📊 Track Progress](../PROGRESS.md) | [🏠 Home](../README.md)
