# JavaScript Execution Model

## 📚 Table of Contents
- [Beginner: How JavaScript Runs](#beginner-how-javascript-runs)
- [Intermediate: The Call Stack & Heap](#intermediate-the-call-stack--heap)
- [Advanced: Memory Management & GC](#advanced-memory-management--gc)

---

## Beginner: How JavaScript Runs

### JavaScript is Single-Threaded

JavaScript has **ONE call stack**. It can only do **ONE thing at a time**.

```javascript
console.log('First');
console.log('Second');
console.log('Third');

// Output (ALWAYS in order):
// First
// Second
// Third
```

### The JavaScript Engine

```
Your Code
    ↓
┌─────────────────────────────────────┐
│         JavaScript Engine           │
│  (V8 in Chrome/Node, SpiderMonkey   │
│   in Firefox, JavaScriptCore in     │
│   Safari)                           │
│                                     │
│  ┌─────────────┐  ┌──────────────┐  │
│  │  Call Stack │  │     Heap     │  │
│  │             │  │              │  │
│  │ (Execution) │  │  (Memory)    │  │
│  └─────────────┘  └──────────────┘  │
└─────────────────────────────────────┘
```

### How Code Executes

```javascript
function greet(name) {
  return 'Hello ' + name;
}

function sayHello() {
  const message = greet('Rahul');
  console.log(message);
}

sayHello();
```

**Execution order:**
1. `sayHello()` called → pushed to call stack
2. Inside `sayHello`: `greet('Rahul')` called → pushed to stack
3. `greet` returns 'Hello Rahul' → popped from stack
4. `console.log` called → pushed, executes, popped
5. `sayHello` done → popped from stack
6. Stack empty → program done

---

## Intermediate: The Call Stack & Heap

### Visualizing the Call Stack

```javascript
function multiply(x, y) {
  return x * y;
}

function square(n) {
  return multiply(n, n);
}

function printSquare(n) {
  const squared = square(n);
  console.log(squared);
}

printSquare(4);
```

**Stack at each point:**

```
Step 1: printSquare(4)          Step 2: square(4)
┌────────────────────┐          ┌────────────────────┐
│    printSquare     │          │      square        │
└────────────────────┘          ├────────────────────┤
                                │    printSquare     │
                                └────────────────────┘

Step 3: multiply(4, 4)          Step 4: returns 16
┌────────────────────┐          ┌────────────────────┐
│     multiply       │          │    printSquare     │
├────────────────────┤          └────────────────────┘
│      square        │
├────────────────────┤
│    printSquare     │
└────────────────────┘
```

### Stack Overflow

```javascript
// ❌ Infinite recursion
function recursive() {
  recursive();  // Calls itself forever
}
recursive();

// Error: Maximum call stack size exceeded
// (Stack is limited, typically ~10,000-15,000 frames)
```

### The Heap: Where Objects Live

```javascript
// Primitives: stored directly
let age = 25;           // Value stored with variable
let name = 'Rahul';     // String stored with variable

// Objects: stored in heap, variable holds reference
let user = { name: 'Rahul', age: 25 };
// user → [reference] → { actual object in heap }
```

**Memory visualization:**

```
Stack (Variables)                Heap (Objects)
┌──────────────────┐            ┌────────────────────┐
│ age: 25          │            │ ┌──────────────────┐│
│ name: 'Rahul'    │            │ │ { name: 'Rahul', ││
│ user: ref:0x123 ─┼────────────┼→│   age: 25 }      ││
└──────────────────┘            │ └──────────────────┘│
                                └────────────────────┘
```

### Reference vs Value

```javascript
// Primitives: copied by value
let a = 10;
let b = a;
b = 20;
console.log(a); // 10 (unchanged)

// Objects: copied by reference
let obj1 = { value: 10 };
let obj2 = obj1;
obj2.value = 20;
console.log(obj1.value); // 20 (changed!)
```

---

## Advanced: Memory Management & GC

### Garbage Collection

JavaScript automatically frees memory using **Mark and Sweep**:

1. **Mark**: Start from roots (global object, current call stack)
2. **Sweep**: Any object not reachable from roots is garbage

```javascript
function createUser() {
  const user = { name: 'Rahul' };  // Created in heap
  return user.name;                 // Only name returned
}

const name = createUser();
// After function: user object has no references → garbage collected
```

### Memory Leaks (Things That Prevent GC)

#### 1. Accidental Global Variables

```javascript
// ❌ Creates global (in non-strict mode)
function leak() {
  leakedVar = 'I am global now!';
}

// ✅ Use strict mode
'use strict';
function noLeak() {
  const localVar = 'I will be garbage collected';
}
```

#### 2. Forgotten Timers

```javascript
// ❌ Timer holds reference forever
const data = fetchHugeData();
setInterval(() => {
  console.log(data);  // data can never be GC'd
}, 1000);

// ✅ Clear timers when done
const intervalId = setInterval(() => { ... }, 1000);
clearInterval(intervalId);
```

#### 3. Closures Holding References

```javascript
// ❌ Closure keeps entire outer scope
function outer() {
  const hugeArray = new Array(1000000).fill('x');
  
  return function inner() {
    // Even if inner doesn't use hugeArray,
    // some engines keep the entire scope
    return 'inner';
  };
}

const fn = outer();  // hugeArray might not be GC'd
```

#### 4. DOM References

```javascript
// ❌ Element removed but reference kept
const button = document.getElementById('myButton');
document.body.removeChild(button);
// button variable still references the DOM node
// It can't be garbage collected

// ✅ Clear references
let button = document.getElementById('myButton');
document.body.removeChild(button);
button = null;  // Now it can be GC'd
```

### Execution Context

Every function call creates an **Execution Context**:

```javascript
const globalVar = 'global';

function outer() {
  const outerVar = 'outer';
  
  function inner() {
    const innerVar = 'inner';
    console.log(globalVar, outerVar, innerVar);
  }
  
  inner();
}

outer();
```

**Execution Contexts created:**

```
1. Global Execution Context
   - globalVar = 'global'
   - outer = function

2. outer() Execution Context
   - outerVar = 'outer'
   - inner = function
   - Scope chain → Global

3. inner() Execution Context
   - innerVar = 'inner'
   - Scope chain → outer → Global
```

### Creation Phase vs Execution Phase

Each context has TWO phases:

```javascript
console.log(x);    // undefined (not error!)
console.log(greet); // function greet() { ... }

var x = 10;
function greet() {
  console.log('Hello');
}
```

**Creation Phase:**
1. `var x` → allocated, initialized to `undefined`
2. `function greet` → allocated with full function

**Execution Phase:**
1. `console.log(x)` → logs `undefined`
2. `console.log(greet)` → logs function
3. `x = 10` → assigns value
4. (function declaration already complete)

This is **hoisting** — covered deeply in the next section.

---

## 🎯 Interview Questions

### Fresher Level
1. Is JavaScript single-threaded or multi-threaded?
2. What is the call stack?
3. What causes a stack overflow?

### Mid Level
1. Explain the difference between stack and heap.
2. What happens to local variables after a function returns?
3. How does garbage collection work in JavaScript?

### Senior Level
1. Explain the two phases of execution context creation.
2. How can closures cause memory leaks? How do you prevent this?
3. How would you debug a memory leak in a large JavaScript application?

---

## 🧪 Practice Exercise

**Predict the output:**

```javascript
function outer() {
  var a = 10;
  
  function inner() {
    console.log(a);
    var a = 20;
    console.log(a);
  }
  
  inner();
}

outer();
```

<details>
<summary>Answer</summary>

```
undefined
20
```

**Explanation:**
1. `inner()` has its own `var a` which is hoisted
2. First `console.log(a)` → logs `undefined` (hoisted, not yet assigned)
3. `a = 20` assigns value
4. Second `console.log(a)` → logs `20`

The outer `a` is **shadowed** by inner's `a`.

</details>

---

**Next**: [Scope & Closures](../02_scope-closures/)
