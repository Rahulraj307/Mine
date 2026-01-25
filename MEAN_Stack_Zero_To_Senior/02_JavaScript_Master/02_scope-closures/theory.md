# Scope & Closures

## 📚 Table of Contents
- [Beginner: What is Scope?](#beginner-what-is-scope)
- [Intermediate: Closures Explained](#intermediate-closures-explained)
- [Advanced: Closures in Memory](#advanced-closures-in-memory)

---

## Beginner: What is Scope?

### Definition
**Scope** determines where variables are accessible in your code.

### Types of Scope

```javascript
// 1. GLOBAL SCOPE
const globalVar = 'I am everywhere';

function example() {
  // 2. FUNCTION SCOPE
  var functionVar = 'I am inside this function only';
  
  if (true) {
    // 3. BLOCK SCOPE (let/const only)
    let blockVar = 'I am inside this block only';
    const alsoBlock = 'Me too';
    
    var notBlockScoped = 'I leak to function scope!';
  }
  
  console.log(notBlockScoped); // Works (var ignores blocks)
  console.log(blockVar);       // ReferenceError!
}
```

### var vs let vs const

| Feature | var | let | const |
|---------|-----|-----|-------|
| Scope | Function | Block | Block |
| Hoisting | Yes (undefined) | Yes (TDZ) | Yes (TDZ) |
| Re-declaration | Allowed | Error | Error |
| Re-assignment | Allowed | Allowed | Error |

### Temporal Dead Zone (TDZ)

```javascript
console.log(x); // undefined (var is hoisted and initialized)
console.log(y); // ReferenceError: Cannot access 'y' before initialization
console.log(z); // ReferenceError (same as let)

var x = 1;
let y = 2;
const z = 3;
```

**TDZ = Time between entering scope and declaration being reached.**

```javascript
{
  // TDZ starts for 'name'
  console.log(name); // ❌ Error: still in TDZ
  
  let name = 'Rahul'; // TDZ ends
  
  console.log(name); // ✅ 'Rahul'
}
```

### Scope Chain

When you access a variable, JavaScript looks:
1. Current scope
2. Parent scope
3. Parent's parent scope
4. ... up to global scope

```javascript
const global = 'G';

function outer() {
  const outerVar = 'O';
  
  function inner() {
    const innerVar = 'I';
    
    // Scope chain: inner → outer → global
    console.log(innerVar);  // Found in inner
    console.log(outerVar);  // Found in outer
    console.log(global);    // Found in global
  }
  
  inner();
}
```

---

## Intermediate: Closures Explained

### What is a Closure?

A **closure** is a function that "remembers" variables from its outer scope, even after the outer function has returned.

```javascript
function createCounter() {
  let count = 0;  // Private variable
  
  return function increment() {
    count++;      // "Closes over" count
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3

// count is not accessible directly
console.log(count); // ReferenceError
```

### Why Closures Exist

When `createCounter()` finishes:
- Normally, `count` would be garbage collected
- But `increment` still references it
- So JavaScript keeps `count` alive in memory

### Practical Use Cases

#### 1. Data Privacy

```javascript
function createBankAccount(initialBalance) {
  let balance = initialBalance; // Private!
  
  return {
    deposit(amount) {
      balance += amount;
      return balance;
    },
    withdraw(amount) {
      if (amount > balance) throw new Error('Insufficient funds');
      balance -= amount;
      return balance;
    },
    getBalance() {
      return balance;
    }
  };
}

const account = createBankAccount(100);
account.deposit(50);     // 150
account.withdraw(30);    // 120
account.balance;         // undefined (private!)
account.getBalance();    // 120
```

#### 2. Function Factories

```javascript
function createMultiplier(multiplier) {
  return function(num) {
    return num * multiplier;
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15
```

#### 3. Memoization

```javascript
function memoize(fn) {
  const cache = {};  // Closure holds the cache
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache[key] !== undefined) {
      console.log('From cache');
      return cache[key];
    }
    
    console.log('Computing');
    const result = fn(...args);
    cache[key] = result;
    return result;
  };
}

const factorial = memoize(function(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
});

factorial(5);  // Computing (calculates)
factorial(5);  // From cache (instant)
```

### The Classic Loop Problem

```javascript
// ❌ WRONG: All callbacks share the same 'i'
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, 1000);
}
// Output: 3, 3, 3 (all print 3!)

// ✅ FIX 1: Use let (block scoped)
for (let i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, 1000);
}
// Output: 0, 1, 2

// ✅ FIX 2: Create closure per iteration
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => {
      console.log(j);
    }, 1000);
  })(i);
}
// Output: 0, 1, 2
```

---

## Advanced: Closures in Memory

### How Closures Work Internally

```javascript
function outer() {
  const x = 10;
  const y = 20;
  
  return function inner() {
    return x; // Only uses x
  };
}

const fn = outer();
```

**Memory representation:**

```
After outer() returns:

Stack                         Heap
┌─────────────────────┐      ┌─────────────────────────────┐
│ fn: ref:0x123 ──────┼──────┼→ function inner() {        │
└─────────────────────┘      │    [[Scope]]: {            │
                             │      x: 10                 │
                             │      (y might be dropped)  │
                             │    }                       │
                             │  }                         │
                             └─────────────────────────────┘
```

### What Gets Captured?

Modern JavaScript engines are smart:

```javascript
function test() {
  const usedVar = 'kept';
  const unusedVar = 'might be garbage collected';
  const bigArray = new Array(1000000);
  
  return function() {
    return usedVar;  // Only usedVar is needed
  };
}
```

**In theory**: Only `usedVar` should be kept.
**In practice**: Some engines keep everything, some optimize.

**Safe assumption for interviews**: The ENTIRE lexical scope is captured.

### Debugging Closures

```javascript
// In Chrome DevTools, you can inspect closure scope
function createLogger(prefix) {
  return function log(message) {
    debugger; // Pause here and check Scope in DevTools
    console.log(prefix + ': ' + message);
  };
}

const logger = createLogger('App');
logger('Started');
```

### Memory Leak Patterns

#### Leaked Event Listeners

```javascript
// ❌ Memory leak: handler keeps reference to data
function setupUI() {
  const hugeData = loadData();
  
  button.addEventListener('click', function handler() {
    process(hugeData);
  });
  
  // Even if we're done with hugeData, it can't be GC'd
}

// ✅ Fix: Clean up listeners
function setupUI() {
  const hugeData = loadData();
  
  function handler() {
    process(hugeData);
  }
  
  button.addEventListener('click', handler);
  
  // When done:
  button.removeEventListener('click', handler);
}
```

#### Leaked Closures in Modules

```javascript
// ❌ Potential leak
let cache = [];

export function addToCache(item) {
  cache.push(item);
  // Cache grows forever!
}

// ✅ Fix: Bounded cache
const MAX_SIZE = 100;
let cache = [];

export function addToCache(item) {
  if (cache.length >= MAX_SIZE) {
    cache.shift(); // Remove oldest
  }
  cache.push(item);
}
```

---

## 🎯 Interview Questions

### Fresher Level
1. What is scope in JavaScript?
2. What's the difference between let and var?
3. What is a closure? Give a simple example.

### Mid Level
1. Explain the Temporal Dead Zone.
2. Why does `var` in a loop cause issues with `setTimeout`?
3. How can closures be used for data privacy?

### Senior Level
1. How does the scope chain work internally?
2. What gets captured by a closure — the variable or the value?
3. How can closures cause memory leaks, and how do you debug them?

---

## 🧪 Classic Interview Problem

```javascript
function createFunctions() {
  var result = [];
  
  for (var i = 0; i < 3; i++) {
    result.push(function() {
      return i;
    });
  }
  
  return result;
}

var funcs = createFunctions();
console.log(funcs[0]()); // ?
console.log(funcs[1]()); // ?
console.log(funcs[2]()); // ?
```

<details>
<summary>Answer</summary>

```
3
3
3
```

**Why?** All three functions close over the SAME `i`.
By the time they're called, the loop has finished and `i = 3`.

**Fix with let:**
```javascript
for (let i = 0; i < 3; i++) { ... }
// Each iteration gets its own 'i'
```

</details>

---

**Next**: [The 'this' Keyword](../03_this-keyword/)
