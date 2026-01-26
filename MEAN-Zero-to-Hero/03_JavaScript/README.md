# 03 JavaScript: The Core Engine

> **Goal**: Master the Event Loop, Closures, Async Patterns, and "This".

---

## 1️⃣ Concept Explanation

### Single Threaded & Non-Blocking
JavaScript runs on a **single thread** (one thing at a time). However, it handles expensive operations (like API calls) **asynchronously** using the Event Loop, so the UI doesn't freeze.

### Closures
A closure is a function that "remembers" its outer scope even after the outer function has finished executing. This is the foundation of data privacy and factories.

---

## 2️⃣ Code Examples

### ❌ Bad Example (Callback Hell)
```javascript
getData(function(a) {
    getMore(a, function(b) {
        getMore(b, function(c) {
             console.log(c);
        });
    });
});
```

### ✅ Good Example (Async/Await)
```javascript
async function getDataFlow() {
    try {
        const a = await getData();
        const b = await getMore(a);
        const c = await getMore(b);
        console.log(c);
    } catch (error) {
        console.error(error);
    }
}
```

---

## 3️⃣ Internal Working: The Event Loop

1.  **Call Stack**: Executes synchronous code (LIFO).
2.  **Web APIs**: Browser handles timers, fetch, DOM events (background).
3.  **Callback Queue (Task Queue)**: `setTimeout`, `DOM events`.
4.  **Microtask Queue**: `Promises`, `MutationObserver`. (Higher Priority!)

> **Loop Logic**: If (Stack is Empty) -> Run ALL Microtasks -> Run ONE Task -> Render -> Repeat.

---

## 4️⃣ Common Mistakes

### 🚨 Beginner Mistakes
- Using `var` (Global scope leakage, Hoisting confusion).
- Modifying objects directly (Mutation) instead of creating copies (`...spred`).

### ⚠️ Production Mistakes
- **Memory Leaks**: Adding Event Listeners but never removing them (`element.removeEventListener`).
- **Blocking the Stack**: Running a heavy loop (`while(1000000)`) on the main thread (Freezes UI).

---

## 5️⃣ Optimization & Best Practices

### Performance
- **Debounce**: Delay function call until user stops typing (Search bar).
- **Throttle**: Limit function execution to once every X ms (Scroll event).
- **Web Workers**: Offload heavy computations (math, image processing) to a background thread.

### Memory
- Use `WeakMap` or `WeakSet` for caching objects without preventing garbage collection.

---

## 6️⃣ Interview QnA

### Beginner
**Q: Difference between `==` and `===`?**
A: `==` performs type coercion (`"5" == 5` is true). `===` checks value AND type (`"5" === 5` is false).

**Q: What is Hoisting?**
A: Moving variable (`var` and `function`) declarations to the top of their scope. `let` and `const` are technically hoisted but stay in the "Temporal Dead Zone".

### Intermediate
**Q: Output of `console.log(1); setTimeout(()=>console.log(2), 0); Promise.resolve().then(()=>console.log(3)); console.log(4);`?**
A: `1, 4, 3, 2`.
1. `1` (Sync)
2. `4` (Sync)
3. `3` (Microtask - higher priority)
4. `2` (Macrotask - lower priority)

### Scenario-Based
**Q: How does `this` work in Arrow Functions?**
A: Arrow functions do NOT have their own `this`. They inherit `this` from the parent scope (lexical scoping). Regular functions define `this` based on *how* they are called.

---

## 7️⃣ Web References

- [MDN Event Loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop)
- [JavaScript.info (Best Deep Dive)](https://javascript.info/)
- [Namaste JavaScript (YouTube)](https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCvAvr9vNaUccPVNP)
