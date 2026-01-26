# 📘 MASTER INTERVIEW Q&A: JavaScript (Zero to Hero)
> **Section 3: JavaScript (Core → Async → Advanced – 2025 Ready)**
> From "What is a variable?" to Event Loops, Closures, and Memory Leaks.

---

## 🟢 Part 1: The Core Foundation (Variables & Types)

### 1️⃣ What is JavaScript? What is the role of a JS Engine?
**Answer:**
JavaScript is a high-level, interpreted (JIT compiled), single-threaded programming language used to make web pages interactive.

**The Engine (How it works):**
1.  **Parse**: Reads code.
2.  **Compile**: Converts to Machine Code (Just-In-Time compilation).
3.  **Execute**: runs the code.
*   **V8**: Chrome / Node.js
*   **SpiderMonkey**: Firefox
*   **JavaScriptCore**: Safari

### 2️⃣ `var` vs `let` vs `const` (The Classic)
**Answer:**
| Feature | `var` | `let` | `const` |
| :--- | :--- | :--- | :--- |
| **Scope** | Function Scoped | Block Scoped `{}` | Block Scoped `{}` |
| **Hoisting** | Yes (Initialized as `undefined`) | Yes (In **TDZ** - Temporal Dead Zone) | Yes (In **TDZ**) |
| **Reassign?** | Yes | Yes | **No** |

**Interview Trap:** `const` prevents reassignment, NOT mutation.
```javascript
const user = { name: "Rahul" };
user.name = "Raj"; // ✅ Allowed (Mutation)
user = {}; // ❌ Error (Reassignment)
```

### 3️⃣ Data Types (Primitives vs Reference)
**Answer:**
*   **Primitives (Immutable, Stored by Value):** String, Number, Boolean, `null`, `undefined`, Symbol, BigInt.
*   **Non-Primitives (Mutable, Stored by Reference):** Object, Array, Function, Date.

**Coercion Trap:**
```javascript
console.log(1 + "2"); // "12" (String concatenation)
console.log(1 - "2"); // -1 (Numeric conversion)
```

### 4️⃣ `==` vs `===`?
**Answer:**
*   **`==` (Loose Equality):** Performs **Type Coercion**. `5 == "5"` is `true`.
*   **`===` (Strict Equality):** Checks Value **AND** Type. `5 === "5"` is `false`.
*   👉 **Best Practice:** Always use `===`.

### 5️⃣ `null` vs `undefined`?
**Answer:**
*   **`undefined`**: Variable declared but not assigned a value. Use by JS engine default.
*   **`null`**: Intentional absence of any object value. Reset by developer.
```javascript
let a; // undefined
let b = null; // intentional empty
console.log(typeof null); // "object" (Legacy Bug)
console.log(typeof undefined); // "undefined"
```

### 6️⃣ Hoisting Explained
**Answer:**
JavaScript acts as if declarations move to the top of the scope.
*   **Function Declarations**: Fully hoisted `fn()`. Can be called before definition.
*   **`var`**: Hoisted as `undefined`. Accessing before assignment gives `undefined`.
*   **`let` / `const`**: Hoisted but sit in **Temporal Dead Zone (TDZ)**. Accessing before definition throws `ReferenceError`.

---

## 🟡 Part 2: Functions, Objects & ES6+

### 7️⃣ Arrow Functions vs Regular Functions
**Answer:**
1.  **Syntax**: Shorter.
2.  **`arguments`**: Not available in Arrow functions.
3.  **`this` binding (Crucial):**
    *   **Regular**: `this` depends on **how** it is called (dynamic).
    *   **Arrow**: `this` is lexically inherited from parent scope (fixed).

**Interview Code:**
```javascript
const obj = {
  name: "Me",
  regular: function() { console.log(this.name) }, // "Me"
  arrow: () => { console.log(this.name) } // undefined (Window/Global scope)
};
```

### 8️⃣ Shallow Copy vs Deep Copy
**Answer:**
*   **Reference Copy**: `b = a` (Both point to same memory).
*   **Shallow Copy**: `b = {...a}` (Top level specific, nested objects still referenced).
*   **Deep Copy**: `b = JSON.parse(JSON.stringify(a))` (Breaks functions/dates) or `structuredClone(a)` (Modern Best).

### 9️⃣ Destructuring & Spread Operator
**Answer:**
**Destructuring:** Extracting values.
```javascript
const { name, age } = user; // Object
const [first, ...rest] = myArray; // Array
```
**Spread (`...`)**: Expanding iterables.
```javascript
const newArr = [...oldArr, 4, 5]; // Copy & Add
const newObj = { ...oldObj, active: true }; // Copy & Override
```

### 🔟 Higher Order Functions (Map, Filter, Reduce)
**Answer:**
Functions that take a function as an arg or return one.
*   **`forEach`**: Loop, side effects, returns `undefined`.
*   **`map`**: Transform, returns **new array**.
*   **`filter`**: Select, returns **new array** subset.
*   **`reduce`**: Accumulate, returns **single value**.
```javascript
// Sum of array
const sum = nums.reduce((acc, curr) => acc + curr, 0);
```

---

## 🔵 Part 3: Asynchronous JavaScript (The "Hard" Stuff)

### 1️⃣1️⃣ Callback Hell & Promises
**Answer:**
*   **Callback Hell**: Nested callbacks making code unreadable (`fs.read(..., () => fs.write(..., () => ...))`).
*   **Promise**: An object representing the eventual completion (or failure) of an async operation.
    *   States: `Pending` → `Fulfilled` (Resolved) OR `Rejected`.

### 1️⃣2️⃣ `async` / `await` Explained
**Answer:**
Syntactic sugar over Promises. Makes async code look synchronous.
*   **`async` function**: Always returns a Promise.
*   **`await`**: Pauses execution until Promise resolves.
```javascript
async function getData() {
  try {
    const res = await fetch('/api/user');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Failed", error);
  }
}
```

### 1️⃣3️⃣ The Event Loop (Architecture) 🔥
**Answer:**
JS is single-threaded, but non-blocking. How?
1.  **Call Stack**: Executes synchronous code immediately.
2.  **Web APIs**: Browser handles `setTimeout`, `fetch`, DOM clicks.
3.  **Callback Queue (Task Queue)**: Stores `setTimeout` callbacks.
4.  **Microtask Queue**: Stores **Promises** / `queueMicrotask`. **Higher Priority!**
5.  **Event Loop**: Checks "Is Stack Empty?". If yes, push Microtasks first, then Macrotasks (Callback Queue).

**Output Question:**
```javascript
console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
console.log(4);
// Order: 1, 4, 3, 2
```

---

## 🔴 Part 4: Advanced Concepts (Expert Level)

### 1️⃣4️⃣ What is a Closure?
**Answer:**
A function bundled together with references to its surrounding state (lexical environment). **It remembers variables from where it was created, even after the outer function has finished executing.**

**Use Case:** Private data, Currying, Memoization.
```javascript
function createCounter() {
  let count = 0; // Private variable
  return function() {
    count++;
    return count;
  };
}
const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2 (Remembers 'count')
```

### 1️⃣5️⃣ `this` Keyword bindings
**Answer:**
1.  **Default**: `window` (strict mode: `undefined`).
2.  **Implicit**: `obj.method()` → `this` is `obj`.
3.  **Explicit**: `call`, `apply`, `bind`.
    *   `func.call(obj, arg1, arg2)`: Invokes immediately.
    *   `func.apply(obj, [args])`: Invokes immediately (array args).
    *   `func.bind(obj)`: Returns **new function** with `this` locked.
4.  **New**: `new Constructor()` → `this` is the new instance.

### 1️⃣6️⃣ Prototypal Inheritance
**Answer:**
Objects inherit directly from other objects via the prototype chain (`__proto__`).
*   If a property isn't found on an object, JS looks up the chain until it hits `null`.
*   ES6 `class` is just syntactic sugar over this system.

### 1️⃣7️⃣ Event Bubbling vs Capturing (Delegation)
**Answer:**
1.  **Capturing (Trickle Down)**: Window → Parent → Target.
2.  **Target**: The element clicked.
3.  **Bubbling (Bubble Up)**: Target → Parent → Window. (Default behavior).
*   `event.stopPropagation()`: Stops bubbling.
*   **Delegation**: Attaching one listener to a Parent (`<ul>`) instead of 100 children (`<li>`). efficient memory usage.

### 1️⃣8️⃣ Memory Leaks & Garbage Collection
**Answer:**
JS uses **Mark and Sweep** algorithm. Reachable objects are kept; others are deleted.
**Common Leaks:**
1.  **Global Variables**: Accidental `window.data = giantArray`.
2.  **Closures**: Holding references to huge DOM nodes unnecessarily.
3.  **Timers**: `setInterval` running forever without `clearInterval`.
4.  **Event Listeners**: Adding events in SPA components and not removing them in `onDestroy`.

### 1️⃣9️⃣ Debounce vs Throttle (Optimization)
**Answer:**
*   **Debounce**: "Wait for silence." Only run after user STOPS typing for X ms. (Search bars).
*   **Throttle**: "Rate limit." Run at most once every X ms. (Scroll events, Window resize).

### 2️⃣0️⃣ Generator Functions
**Answer:**
Functions that can be paused and resumed using `function*` and `yield`.
Used in Redux-Saga or complex async flows.
```javascript
function* seq() {
  yield 1;
  yield 2;
}
const gen = seq();
console.log(gen.next().value); // 1
```
