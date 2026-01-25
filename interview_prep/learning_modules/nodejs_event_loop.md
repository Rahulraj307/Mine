# Deep Dive: Node.js Event Loop & Internals

> **Goal:** Understand the "Single Thread" myth and how Node handles high concurrency.

## 1. The Concept: ELI5 (The Restaurant Analogy)
Think of a standard web server (Java/PHP) like a **Restaurant with many waiters**.
*   Every customer (Request) gets their own Waiter (Thread).
*   The Waiter takes the order, walks to the kitchen, **waits there** until the food is ready, and brings it back.
*   If you have 100 waiters, you can serve 100 customers. The 101st customer has to wait outside.

Think of **Node.js** like a **Restaurant with ONE Super-Waiter (The Event Loop)**.
*   The Super-Waiter takes an order, puts it on a ticket rail (Checklist), and **immediately goes to the next table**.
*   The Kitchen (Worker Pool/OS) cooks the food in the background.
*   When food is ready, the Kitchen rings a bell (Event).
*   The Super-Waiter comes back *only when they are free* to serve the food.
*   **Result:** One waiter can handle 10,000 customers as long as he never stands still (Blocks).

---

## 2. The Phases of the Event Loop
This is what distinguishes a Junior from a Senior Node dev.

1.  **Timers:** Executes callbacks from `setTimeout()` and `setInterval()`.
2.  **Pending Callbacks:** Executes I/O callbacks deferred to the next loop iteration.
3.  **Idle, Prepare:** Internal Node usage.
4.  **Poll (The Most Important Phase):**
    *   Retrieves new I/O events (Did the file finish reading? Did the DB respond?).
    *   Executes their callbacks.
5.  **Check:** Executes `setImmediate()` callbacks.
6.  **Close Callbacks:** `socket.on('close', ...)` cleanup.

### Microtasks (The VIP Queue)
*   `Promise.then()` and `process.nextTick()` are **NOT** part of the loop phases.
*   They are "VIPs". They get executed **immediately** after the current operation completes, *before* moving to the next phase.
*   **Danger:** If you recursively call `process.nextTick()`, you will starve the Event Loop (nothing else gets done).

---

## 3. Blocking the Event Loop (How to Crash Node)
Since there is only one thread, if you solve a massive Math problem on it, no one else gets served.

**BAD Code (Blocking):**
```javascript
app.get('/heavy', (req, res) => {
  // This freezes the ENTIRE server for everyone!
  // While this runs, no other requests are accepted.
  let count = 0;
  for (let i = 0; i < 10000000000; i++) {
     count += i;
  }
  res.send({ count });
});
```

**GOOD Code (Non-Blocking / Offloading):**
For CPU-heavy tasks, use **Worker Threads** or a separate service.

```javascript
import { Worker } from 'worker_threads';

app.get('/heavy', (req, res) => {
  const worker = new Worker('./heavy-calculation.js');
  
  worker.on('message', (result) => {
    res.send({ result });
  });
  
  worker.on('error', (err) => {
    res.status(500).send(err);
  });
});
```
