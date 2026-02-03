# JavaScript - Topic Index

> Comprehensive JavaScript learning from execution model to ES6+ features

---

## 📚 Complete Guide

| File | Description |
|------|-------------|
| **[complete-roadmap.md](./complete-roadmap.md)** | Full JavaScript roadmap based on [roadmap.sh](https://roadmap.sh/javascript) |
| [README.md](./README.md) | Topic overview |

---

## Topics

| # | Topic | Description | Status |
|---|-------|-------------|--------|
| 01 | [Execution Model](./01_execution-model/) | Call stack, heap, event loop | ⬜ |
| 02 | [Scope & Closures](./02_scope-closures/) | Lexical scope, closure patterns | ⬜ |
| 03 | [This Keyword](./03_this-keyword/) | Binding rules, call/apply/bind | ⬜ |
| 04 | [Async JavaScript](./04_async-javascript/) | Callbacks, Promises, async/await | ⬜ |
| 05 | [Prototypes](./05_prototypes/) | Prototype chain, inheritance | ⬜ |
| 06 | [ES6+ Features](./06_es6-plus/) | Destructuring, spread, modules | ⬜ |

---

## Quick Reference

### Execution Context
```javascript
// Each function creates an execution context
function greet(name) {
  // 1. Creation phase: variable hoisting, this binding
  // 2. Execution phase: code runs line by line
  const message = `Hello, ${name}`;
  return message;
}
```

### Closure
```javascript
function createCounter() {
  let count = 0; // Closed over
  return () => ++count;
}
const counter = createCounter();
counter(); // 1
counter(); // 2
```

### This Binding
```javascript
// 1. Default: window/undefined
// 2. Implicit: obj.method() → this = obj
// 3. Explicit: call/apply/bind
// 4. New: constructor → this = new object
// 5. Arrow: inherits from parent scope
```

### Async Patterns
```javascript
// Promise
fetch('/api').then(res => res.json());

// Async/Await
const data = await fetch('/api');
```

---

## Learning Path

1. ⬜ Understand execution context and call stack
2. ⬜ Master scope chain and closures
3. ⬜ Learn all `this` binding rules
4. ⬜ Practice async patterns
5. ⬜ Understand prototype inheritance
6. ⬜ Use modern ES6+ features

---

## Interview Topics Covered

- ✅ Hoisting and TDZ
- ✅ Closure use cases
- ✅ `this` in different contexts
- ✅ Promise vs callback
- ✅ Event loop explained
- ✅ Prototype vs class

---

[🧭 Navigate](../NAVIGATION.md) | [📊 Track Progress](../PROGRESS.md)
