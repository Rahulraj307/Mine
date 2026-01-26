# ES6+ Features Deep Dive

## 📚 Table of Contents
- [Beginner: Essential ES6 Features](#beginner-essential-es6-features)
- [Intermediate: Advanced Patterns](#intermediate-advanced-patterns)
- [Advanced: Performance & Internals](#advanced-performance--internals)

---

## Beginner: Essential ES6 Features

### let & const

```javascript
// var: function-scoped, hoisted
var x = 1;

// let: block-scoped, TDZ
let y = 2;

// const: block-scoped, TDZ, can't reassign
const z = 3;
z = 4; // TypeError

// const with objects: reference is constant, not contents
const obj = { a: 1 };
obj.a = 2;      // ✅ OK
obj = {};       // ❌ TypeError
```

### Arrow Functions

```javascript
// Traditional
function add(a, b) {
  return a + b;
}

// Arrow function
const add = (a, b) => a + b;

// Key differences:
// 1. No own 'this'
// 2. No 'arguments' object
// 3. Cannot be used with 'new'
// 4. No 'prototype' property
```

### Template Literals

```javascript
const name = 'Rahul';
const age = 25;

// Multi-line strings
const message = `
  Hello ${name}!
  You are ${age} years old.
  Next year you'll be ${age + 1}.
`;

// Tagged templates
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => 
    `${result}${str}<mark>${values[i] || ''}</mark>`, '');
}

highlight`Hello ${name}, welcome!`;
// "Hello <mark>Rahul</mark>, welcome!<mark></mark>"
```

### Destructuring

```javascript
// Array destructuring
const [first, second, ...rest] = [1, 2, 3, 4, 5];
// first = 1, second = 2, rest = [3, 4, 5]

// Object destructuring
const { name, age, city = 'Delhi' } = { name: 'Rahul', age: 25 };
// name = 'Rahul', age = 25, city = 'Delhi' (default)

// Nested destructuring
const { user: { name: userName } } = { user: { name: 'Rahul' } };
// userName = 'Rahul'

// In function parameters
function greet({ name, age }) {
  console.log(`${name} is ${age}`);
}
greet({ name: 'Rahul', age: 25 });
```

### Spread & Rest

```javascript
// Spread: Expand
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];  // [1, 2, 3, 4, 5]

const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }

// Rest: Collect
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3, 4); // 10
```

### Default Parameters

```javascript
function greet(name = 'Guest', greeting = 'Hello') {
  return `${greeting}, ${name}!`;
}

greet();              // "Hello, Guest!"
greet('Rahul');       // "Hello, Rahul!"
greet('Rahul', 'Hi'); // "Hi, Rahul!"

// Defaults are evaluated at call time
function getDefault() { return Date.now(); }
function log(timestamp = getDefault()) {
  console.log(timestamp);
}
```

---

## Intermediate: Advanced Patterns

### Enhanced Object Literals

```javascript
const name = 'Rahul';
const age = 25;

const user = {
  name,           // Shorthand property
  age,
  greet() {       // Shorthand method
    return `Hello, ${this.name}`;
  },
  ['key' + 1]: 'dynamic key',  // Computed property
};

// { name: 'Rahul', age: 25, greet: fn, key1: 'dynamic key' }
```

### Symbols

```javascript
// Unique identifiers
const id = Symbol('id');
const anotherId = Symbol('id');

console.log(id === anotherId); // false (always unique)

// Use as object keys (won't clash)
const user = {
  name: 'Rahul',
  [id]: 123
};

console.log(user[id]); // 123
console.log(Object.keys(user)); // ['name'] - symbols not enumerable
```

### Iterators & Generators

```javascript
// Iterator protocol
const iterable = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() {
        if (i < 3) {
          return { value: i++, done: false };
        }
        return { done: true };
      }
    };
  }
};

for (const num of iterable) {
  console.log(num); // 0, 1, 2
}

// Generator function
function* countdown(from) {
  while (from > 0) {
    yield from--;
  }
}

const counter = countdown(3);
counter.next(); // { value: 3, done: false }
counter.next(); // { value: 2, done: false }
counter.next(); // { value: 1, done: false }
counter.next(); // { value: undefined, done: true }
```

### Map & Set

```javascript
// Map: key-value with any key type
const map = new Map();
map.set('string', 1);
map.set(42, 'number key');
map.set({ id: 1 }, 'object key');

map.get('string'); // 1
map.has(42);       // true
map.size;          // 3

// Set: unique values
const set = new Set([1, 2, 2, 3, 3, 3]);
[...set]; // [1, 2, 3]

set.add(4);
set.has(2);  // true
set.delete(1);
```

### WeakMap & WeakSet

```javascript
// WeakMap: keys must be objects, garbage-collectable
const cache = new WeakMap();

function process(obj) {
  if (!cache.has(obj)) {
    cache.set(obj, expensiveOperation(obj));
  }
  return cache.get(obj);
}

// When obj is no longer referenced elsewhere,
// it can be garbage collected (even if in WeakMap)
```

### Optional Chaining & Nullish Coalescing

```javascript
// Optional chaining (?.)
const user = { profile: { name: 'Rahul' } };

user.profile?.name;           // 'Rahul'
user.settings?.theme;         // undefined (no error)
user.getAddress?.();          // undefined (no error)
user.roles?.[0];              // undefined (no error)

// Nullish coalescing (??)
const value = null ?? 'default';    // 'default'
const zero = 0 ?? 'default';        // 0 (only null/undefined trigger ??)
const empty = '' ?? 'default';      // '' (only null/undefined trigger ??)

// Compare with ||
const zeroOr = 0 || 'default';      // 'default' (0 is falsy)
const emptyOr = '' || 'default';    // 'default' ('' is falsy)
```

---

## Advanced: Performance & Internals

### Proxy & Reflect

```javascript
const handler = {
  get(target, prop) {
    console.log(`Getting ${prop}`);
    return Reflect.get(target, prop);
  },
  set(target, prop, value) {
    console.log(`Setting ${prop} = ${value}`);
    return Reflect.set(target, prop, value);
  }
};

const obj = new Proxy({ x: 1 }, handler);
obj.x;     // logs "Getting x", returns 1
obj.y = 2; // logs "Setting y = 2"

// Use cases:
// - Validation
// - Logging
// - Default values
// - Reactive systems (Vue.js)
```

### Private Class Fields

```javascript
class Counter {
  #count = 0;  // Private
  
  increment() {
    this.#count++;
  }
  
  get value() {
    return this.#count;
  }
}

const c = new Counter();
c.increment();
c.value;    // 1
c.#count;   // SyntaxError
```

### Modern Array Methods

```javascript
// Array.from: create array from iterable
Array.from('hello');            // ['h', 'e', 'l', 'l', 'o']
Array.from({ length: 3 });      // [undefined, undefined, undefined]
Array.from({ length: 3 }, (_, i) => i); // [0, 1, 2]

// Array.of: create array from arguments
Array.of(1, 2, 3);              // [1, 2, 3]

// .find() and .findIndex()
[1, 2, 3, 4].find(x => x > 2);       // 3
[1, 2, 3, 4].findIndex(x => x > 2);  // 2

// .includes()
[1, 2, 3].includes(2);          // true

// .flat() and .flatMap()
[1, [2, [3]]].flat();           // [1, 2, [3]]
[1, [2, [3]]].flat(2);          // [1, 2, 3]
[1, 2].flatMap(x => [x, x * 2]); // [1, 2, 2, 4]

// .at() - negative indexing
[1, 2, 3].at(-1);               // 3
```

### Performance Considerations

```javascript
// Spread is slower than concat for large arrays
const large = new Array(1000000).fill(0);

// ❌ Slower
const copy1 = [...large];

// ✅ Faster
const copy2 = large.slice();

// Object spread creates shallow copies
const obj = { a: { b: 1 } };
const clone = { ...obj };
clone.a.b = 2;
console.log(obj.a.b); // 2 (same reference!)

// Deep clone with structuredClone (modern)
const deepClone = structuredClone(obj);
```

---

## 🎯 Interview Questions

### Fresher Level
1. What's the difference between `let`, `const`, and `var`?
2. Explain destructuring with an example.
3. What is the spread operator?

### Mid Level
1. How do arrow functions differ from regular functions?
2. Explain `Map` vs plain object.
3. What is optional chaining?

### Senior Level
1. How would you use Proxy for validation?
2. Explain when WeakMap is preferable to Map.
3. What are the performance implications of spread operators on large data?

---

**Next**: [Performance & Memory](../07_performance-memory/)
