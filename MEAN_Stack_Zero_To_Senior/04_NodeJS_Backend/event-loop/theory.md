# Node.js Event Loop

## 📚 Table of Contents
- [Beginner: Why Node.js is Different](#beginner-why-nodejs-is-different)
- [Intermediate: Event Loop Phases](#intermediate-event-loop-phases)
- [Advanced: Blocking, Starvation, and Optimization](#advanced-blocking-starvation-and-optimization)

---

## Beginner: Why Node.js is Different

### Traditional Server Model (Apache/PHP)

```
Request 1 → Thread 1 → Process → Wait for DB → Response
Request 2 → Thread 2 → Process → Wait for DB → Response
Request 3 → Thread 3 → Process → Wait for DB → Response
...
Request N → BLOCKED (no more threads available)
```

**Problem**: One thread per request. Threads are expensive (memory). Limited scalability.

### Node.js Model

```
Request 1 ─┐
Request 2 ─┼→ Single Thread → Event Loop → Callbacks → Responses
Request 3 ─┘
    ...      (Thousands of concurrent connections)
```

**Key Insight**: Node doesn't wait. It registers callbacks and moves on.

### Non-Blocking I/O

```javascript
// Blocking (traditional)
const data = readFileSync('file.txt');  // Thread waits here
console.log(data);

// Non-blocking (Node way)
readFile('file.txt', (err, data) => {
  console.log(data);  // Called later
});
console.log('This runs immediately!');
```

### Why This Works

Most server time is spent **waiting**:
- Database queries: ~10ms
- API calls: ~100ms
- Disk reads: ~10ms

Node doesn't waste a thread waiting. It handles other requests instead.

---

## Intermediate: Event Loop Phases

### The Complete Picture

```
   ┌───────────────────────────────────────┐
┌─>│           timers (setTimeout)         │
│  └───────────────────────────────────────┘
│  ┌───────────────────────────────────────┐
│  │     pending callbacks (I/O errors)    │
│  └───────────────────────────────────────┘
│  ┌───────────────────────────────────────┐
│  │         idle, prepare (internal)      │
│  └───────────────────────────────────────┘
│  ┌───────────────────────────────────────┐
│  │           poll (I/O callbacks)        │<──── connections
│  └───────────────────────────────────────┘
│  ┌───────────────────────────────────────┐
│  │           check (setImmediate)        │
│  └───────────────────────────────────────┘
│  ┌───────────────────────────────────────┐
└──│       close callbacks (cleanup)       │
   └───────────────────────────────────────┘
   
   Between phases: process.nextTick() and Promise microtasks
```

### Phase Details

#### 1. Timers
```javascript
setTimeout(() => console.log('timer'), 100);
// Executed when 100ms has passed and loop reaches this phase
```

#### 2. Poll Phase
```javascript
// Most I/O callbacks execute here
fs.readFile('file.txt', (err, data) => {
  console.log('File read');  // Poll phase
});

// The loop blocks here if nothing else to do
// Waiting for new I/O events
```

#### 3. Check Phase
```javascript
setImmediate(() => console.log('immediate'));
// Always executes after poll phase
```

### setTimeout vs setImmediate

```javascript
// Order is NOT guaranteed when called from main module
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
// Could be either order!

// Order IS guaranteed inside I/O callback
fs.readFile('file.txt', () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
  // Always: immediate, then timeout
});
```

### process.nextTick()

```javascript
// Runs BEFORE the next event loop phase
console.log('start');
process.nextTick(() => console.log('nextTick'));
console.log('end');

// Output:
// start
// end
// nextTick
```

**Priority**: `nextTick` > microtasks > event loop phases

### Execution Order Example

```javascript
console.log('1: Start');

setTimeout(() => console.log('2: setTimeout'), 0);

setImmediate(() => console.log('3: setImmediate'));

Promise.resolve().then(() => console.log('4: Promise'));

process.nextTick(() => console.log('5: nextTick'));

console.log('6: End');
```

**Output:**
```
1: Start
6: End
5: nextTick
4: Promise
2: setTimeout (or 3)
3: setImmediate (or 2)
```

---

## Advanced: Blocking, Starvation, and Optimization

### Blocking the Event Loop

```javascript
// ❌ NEVER DO THIS
app.get('/compute', (req, res) => {
  let sum = 0;
  for (let i = 0; i < 1e10; i++) {
    sum += i;  // Blocks for seconds
  }
  res.send({ sum });
});
// ALL other requests wait!
```

### Common Blocking Operations

```javascript
// ❌ Crypto (CPU intensive)
crypto.pbkdf2Sync(password, salt, iterations, keylen, 'sha512');

// ✅ Use async version
crypto.pbkdf2(password, salt, iterations, keylen, 'sha512', callback);

// ❌ JSON parsing large objects
const data = JSON.parse(hugeString);  // Blocks

// ❌ File system sync methods
const content = fs.readFileSync('huge.txt');

// ❌ Complex regex
/a]aaaa+$/.test('aaaaaaaaaaaaaaaaaaaaaaaaaaa...');  // ReDoS attack
```

### Solutions for CPU-Intensive Tasks

#### 1. Worker Threads
```javascript
const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
  const worker = new Worker(__filename);
  worker.on('message', result => console.log(result));
  worker.postMessage({ calculate: 1e10 });
} else {
  parentPort.on('message', data => {
    // Heavy computation runs in separate thread
    const result = heavyComputation(data);
    parentPort.postMessage(result);
  });
}
```

#### 2. Child Processes
```javascript
const { fork } = require('child_process');
const compute = fork('./compute.js');

compute.send({ n: 1e10 });
compute.on('message', result => {
  console.log(result);
});
```

#### 3. External Services
```javascript
// Offload to:
// - Message queues (RabbitMQ, Redis)
// - Serverless functions
// - Dedicated compute services
```

### Starvation

```javascript
// ❌ nextTick starvation
function recursiveNextTick() {
  process.nextTick(recursiveNextTick);
}
recursiveNextTick();  // Event loop never proceeds!

// ✅ Use setImmediate instead
function recursiveImmediate() {
  setImmediate(recursiveImmediate);
}
recursiveImmediate();  // I/O can still happen
```

### Monitoring the Event Loop

```javascript
// Simple lag detection
const start = Date.now();
setInterval(() => {
  const lag = Date.now() - start;
  if (lag > 100) {
    console.warn('Event loop lag:', lag);
  }
}, 100);

// Using built-in
const { monitorEventLoopDelay } = require('perf_hooks');
const histogram = monitorEventLoopDelay();
histogram.enable();

setInterval(() => {
  console.log('Max delay:', histogram.max / 1e6, 'ms');
}, 5000);
```

---

## 🎯 Interview Questions

### Fresher Level
1. Why is Node.js called non-blocking?
2. What is the event loop?
3. What's the difference between `setTimeout` and `setImmediate`?

### Mid Level
1. Explain the event loop phases.
2. When would you use `process.nextTick()`?
3. How does Node handle concurrent connections?

### Senior Level
1. How would you handle CPU-intensive tasks in Node?
2. Explain event loop starvation.
3. How would you monitor event loop performance in production?

---

## 🧪 Interview Problem

**What's the output?**

```javascript
const fs = require('fs');

setImmediate(() => console.log('1: immediate'));

fs.readFile('package.json', () => {
  setTimeout(() => console.log('2: timeout in IO'), 0);
  setImmediate(() => console.log('3: immediate in IO'));
});

setTimeout(() => console.log('4: timeout'), 0);

Promise.resolve().then(() => console.log('5: promise'));

process.nextTick(() => console.log('6: nextTick'));

console.log('7: sync');
```

<details>
<summary>Answer</summary>

```
7: sync
6: nextTick
5: promise
1: immediate / 4: timeout (order may vary)
4: timeout / 1: immediate (order may vary)
3: immediate in IO  (always before timeout in IO callback)
2: timeout in IO
```

**Key insight**: Inside an I/O callback, `setImmediate` always runs before `setTimeout(0)`.

</details>

---

**Next**: [Streams](../streams/)
