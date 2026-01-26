# 06 Node.js: The Runtime

> **Goal**: Master the Event Loop, Non-Blocking I/O, and Streams.

---

## 1️⃣ Concept Explanation

### What is Node.js?
It is a **runtime environment** for executing JavaScript outside the browser. It uses Chrome's V8 engine and `libuv` for asynchronous I/O.

### Blocking vs Non-Blocking
- **Blocking**: Reading a file synchronously halts the entire process. (Bad).
- **Non-Blocking**: Reading a file allows other code to run while waiting for the disk. (Good).

---

## 2️⃣ Code Examples

### ❌ Bad Example (Blocking the Event Loop)
```javascript
const fs = require('fs');

// CPU halts here until file is read
const data = fs.readFileSync('/large-file.txt');
console.log(data);
```

### ✅ Good Example (Stream - Memory Efficient)
```javascript
const fs = require('fs');

// Flows like water, chunk by chunk
fs.createReadStream('/large-file.txt')
  .pipe(process.stdout);
```

---

## 3️⃣ Internal Working: The Reactor Pattern

1.  **V8 Engine**: Executes JS code.
2.  **Call Stack**: Tracks function calls.
3.  **Libuv**: Handles OS operations (File System, Network) in a thread pool (default 4 threads).
4.  **Callback Queue**: When Libuv finishes, it pushes the callback here.
5.  **Event Loop**: Checks if Stack is empty, then moves Callback to Stack.

---

## 4️⃣ Common Mistakes

### 🚨 Beginner Mistakes
- **Sync Functions in Production**: Using `readFileSync` inside an API handler. (Kills throughput).
- **Ignoring Errors**: Streams emit 'error' events. If unhandled, the process crashes.

### ⚠️ Production Mistakes
- **CPU Bound Tasks**: Running things like Image Compression or Crypto on the main thread.
    - **Fix**: Use `Worker Threads` or a separate Microservice.

---

## 5️⃣ Optimization & Best Practices

### Scaling
- **Cluster Module**: Node is single-threaded. Use `cluster` to fork a process for every CPU Core.
- **PM2**: Process Manager to handle clustering and restarts automatically.

### Memory
- **Buffers**: Use Buffers for binary data optimization.
- **Streams**: Always pipe data instead of loading it entirely into RAM.

---

## 6️⃣ Interview QnA

### Beginner
**Q: Global objects in Node vs Window?**
A: Browser has `window`. Node has `global`.

### Intermediate
**Q: `process.nextTick` vs `setImmediate`?**
A: `nextTick` fires *immediately* after the current operation (before IO). `setImmediate` fires in the Check phase of the Event Loop (after IO).

### Scenario-Based
**Q: How do you debug a memory leak?**
A:
1.  Run with `--inspect`.
2.  Open Chrome DevTools (`chrome://inspect`).
3.  Take Heap Snapshots.
4.  Compare snapshots to see which objects are accumulating (usually Closures or Event Emitters).

---

## 7️⃣ Web References

- [Node.js Docs](https://nodejs.org/en/docs/)
- [Don't Block the Event Loop](https://nodejs.org/en/docs/guides/dont-block-the-event-loop/)
