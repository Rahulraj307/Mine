# Asynchronous JavaScript

## 📚 Table of Contents
- [Beginner: Why Async?](#beginner-why-async)
- [Intermediate: Callbacks → Promises → Async/Await](#intermediate-callbacks--promises--asyncawait)
- [Advanced: Event Loop & Task Queues](#advanced-event-loop--task-queues)

---

## Beginner: Why Async?

### The Problem: Blocking

JavaScript is single-threaded. Long operations would freeze everything:

```javascript
// If JS waited for this, your UI would freeze
const data = fetchFromServer();  // 3 seconds...
console.log(data);               // Nothing works until this completes
button.click();                  // User can't interact
```

### The Solution: Don't Wait

```javascript
// Tell JS what to do when data arrives
fetchFromServer(function(data) {
  console.log(data);
});
console.log('I run immediately!');  // Doesn't wait
button.click();                     // UI stays responsive
```

### Mental Model

```
Synchronous                    Asynchronous
─────────────                  ─────────────
Task A ████████                Task A ███
     ↓                              ↓
Task B ████████                Task B ███  (Task A completes later)
     ↓                              ↓         ↓
Task C ████████                Task C ███  Task A callback
                               (Parallel, non-blocking)
```

---

## Intermediate: Callbacks → Promises → Async/Await

### Level 1: Callbacks

```javascript
function fetchUser(userId, callback) {
  setTimeout(() => {
    const user = { id: userId, name: 'Rahul' };
    callback(user);
  }, 1000);
}

fetchUser(1, function(user) {
  console.log(user.name);  // 'Rahul' (after 1 second)
});
```

**The Problem: Callback Hell**

```javascript
fetchUser(1, function(user) {
  fetchPosts(user.id, function(posts) {
    fetchComments(posts[0].id, function(comments) {
      fetchLikes(comments[0].id, function(likes) {
        // 4 levels deep... nightmare to maintain
        console.log(likes);
      });
    });
  });
});
```

### Level 2: Promises

A Promise is an object representing the eventual completion/failure of an async operation.

```javascript
// Creating a promise
function fetchUser(userId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userId > 0) {
        resolve({ id: userId, name: 'Rahul' });
      } else {
        reject(new Error('Invalid user ID'));
      }
    }, 1000);
  });
}

// Using a promise
fetchUser(1)
  .then(user => {
    console.log(user.name);
  })
  .catch(error => {
    console.error(error.message);
  });
```

**Promise States:**

```
┌───────────────┐
│   PENDING     │  ← Initial state
└───────┬───────┘
        │
        ├──────────────────────────────┐
        ↓                              ↓
┌───────────────┐              ┌───────────────┐
│  FULFILLED    │              │   REJECTED    │
│  (.then())    │              │   (.catch())  │
└───────────────┘              └───────────────┘
```

**Chaining (Fixes Callback Hell):**

```javascript
fetchUser(1)
  .then(user => fetchPosts(user.id))
  .then(posts => fetchComments(posts[0].id))
  .then(comments => fetchLikes(comments[0].id))
  .then(likes => console.log(likes))
  .catch(error => console.error(error));
```

### Level 3: Async/Await

Syntactic sugar over promises that looks synchronous:

```javascript
async function loadUserData(userId) {
  try {
    const user = await fetchUser(userId);       // Waits, but non-blocking
    const posts = await fetchPosts(user.id);
    const comments = await fetchComments(posts[0].id);
    const likes = await fetchLikes(comments[0].id);
    console.log(likes);
  } catch (error) {
    console.error(error);
  }
}

loadUserData(1);
```

**Rules:**
1. `await` only works inside `async` functions
2. `async` functions always return a Promise
3. `await` pauses the function, not the entire thread

### Parallel vs Sequential

```javascript
// ❌ SEQUENTIAL: Each waits for previous (slow)
async function slow() {
  const a = await fetchA();  // Wait 1 sec
  const b = await fetchB();  // Wait 1 sec
  const c = await fetchC();  // Wait 1 sec
  // Total: 3 seconds
}

// ✅ PARALLEL: All start at once (fast)
async function fast() {
  const [a, b, c] = await Promise.all([
    fetchA(),  // All start immediately
    fetchB(),
    fetchC()
  ]);
  // Total: 1 second (slowest request)
}
```

### Promise Methods

```javascript
// Promise.all: All must succeed
Promise.all([p1, p2, p3])
  .then(([r1, r2, r3]) => { /* All results */ })
  .catch(error => { /* First failure */ });

// Promise.allSettled: Get all results regardless of failure
Promise.allSettled([p1, p2, p3])
  .then(results => {
    results.forEach(r => {
      if (r.status === 'fulfilled') console.log(r.value);
      if (r.status === 'rejected') console.log(r.reason);
    });
  });

// Promise.race: First to complete (success or failure)
Promise.race([p1, p2, p3])
  .then(winner => { /* First result */ });

// Promise.any: First successful (ignores failures)
Promise.any([p1, p2, p3])
  .then(winner => { /* First success */ })
  .catch(aggregateError => { /* All failed */ });
```

---

## Advanced: Event Loop & Task Queues

### The Complete Picture

```
┌─────────────────────────────────────────────────────────┐
│                    JavaScript Engine                     │
│  ┌─────────────┐                    ┌─────────────────┐ │
│  │ Call Stack  │                    │      Heap       │ │
│  │             │                    │   (Objects)     │ │
│  └─────────────┘                    └─────────────────┘ │
└───────────┬─────────────────────────────────────────────┘
            │
            ↓
┌─────────────────────────────────────────────────────────┐
│                     Event Loop                           │
│                                                          │
│  1. Execute call stack until empty                       │
│  2. Process ALL microtasks                               │
│  3. Process ONE macrotask                                │
│  4. Repeat                                               │
└─────────────────────────────────────────────────────────┘
            ↕                              ↕
┌─────────────────────────┐    ┌─────────────────────────┐
│    Microtask Queue      │    │     Macrotask Queue     │
│ • Promise callbacks     │    │ • setTimeout            │
│ • queueMicrotask()      │    │ • setInterval           │
│ • MutationObserver      │    │ • I/O callbacks         │
│ (Higher priority)       │    │ • UI rendering          │
└─────────────────────────┘    └─────────────────────────┘
```

### Microtasks vs Macrotasks

```javascript
console.log('1: Start');

setTimeout(() => {
  console.log('2: setTimeout (macrotask)');
}, 0);

Promise.resolve().then(() => {
  console.log('3: Promise (microtask)');
});

queueMicrotask(() => {
  console.log('4: queueMicrotask');
});

console.log('5: End');
```

**Output:**
```
1: Start
5: End
3: Promise (microtask)
4: queueMicrotask
2: setTimeout (macrotask)
```

**Why?**
1. Sync code runs first (1, 5)
2. ALL microtasks run (3, 4)
3. ONE macrotask runs (2)

### Complex Example

```javascript
console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

Promise.resolve()
  .then(() => {
    console.log('promise1');
  })
  .then(() => {
    console.log('promise2');
  });

Promise.resolve().then(() => {
  console.log('promise3');
});

console.log('script end');
```

<details>
<summary>Output & Explanation</summary>

```
script start
script end
promise1
promise3
promise2
setTimeout
```

**Step by step:**
1. `script start` - sync
2. setTimeout callback → macrotask queue
3. First promise then → microtask queue
4. Second promise then → microtask queue
5. `script end` - sync
6. Call stack empty → process microtasks
   - `promise1` (first .then)
   - `promise3` (other promise)
   - `promise2` (chained .then, added after promise1)
7. Microtasks empty → process macrotask
   - `setTimeout`

</details>

### Starvation

Microtasks can starve macrotasks:

```javascript
// ❌ Dangerous: Infinite microtasks
function infiniteMicrotasks() {
  return Promise.resolve().then(() => {
    console.log('Microtask');
    return infiniteMicrotasks();  // Never lets macrotasks run!
  });
}
```

### Real-World Patterns

#### Debounce

```javascript
function debounce(fn, delay) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Usage: Only call after 300ms of no typing
const search = debounce(query => fetchResults(query), 300);
input.addEventListener('input', e => search(e.target.value));
```

#### Throttle

```javascript
function throttle(fn, delay) {
  let lastCall = 0;
  
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}

// Usage: Max once per 100ms
const handleScroll = throttle(updateUI, 100);
window.addEventListener('scroll', handleScroll);
```

---

## 🎯 Interview Questions

### Fresher Level
1. What is the difference between sync and async code?
2. What is a callback? What is callback hell?
3. What are the three states of a Promise?

### Mid Level
1. Explain Promise chaining.
2. What's the difference between `Promise.all` and `Promise.allSettled`?
3. How does async/await relate to Promises?

### Senior Level
1. Explain the event loop, microtasks, and macrotasks.
2. What is the execution order of this code? (complex example)
3. How can you prevent microtask starvation?

---

## 🧪 Classic Interview Problem

**What's the output and why?**

```javascript
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

async1();

new Promise(resolve => {
  console.log('promise1');
  resolve();
}).then(() => {
  console.log('promise2');
});

console.log('script end');
```

<details>
<summary>Answer</summary>

```
script start
async1 start
async2
promise1
script end
async1 end
promise2
setTimeout
```

**Key insight:** `await` splits the function. Code after `await` becomes a microtask.

</details>

---

**Next**: [Prototypes & Inheritance](../05_prototypes/)
