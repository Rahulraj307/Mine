# 📘 MASTER INTERVIEW Q&A: Node.js (Zero to Hero)
> **Section 5: Node.js (Backend, Architecture, Scaling – 2025 Standard)**
> From "What is the Event Loop?" to "How to handle 10k requests/second?".

---

## 🟢 Part 1: Node.js Internals (The Non-Negotiables)

### 1️⃣ What is Node.js? Why is it "Single-Threaded" but fast?
**Answer:**
Node.js is a runtime environment for executing JavaScript on the server. It is built on the **V8 Engine**.
*   **Single-Threaded:** It has **one main thread** for all code execution (Call Stack).
*   **Non-Blocking I/O:** It offloads heavy tasks (File I/O, DB calls, Network requests) to the OS kernel or **libuv** thread pool.
*   **Why Fast?** No overhead of creating thousands of threads for connections. Excellent for high-concurrency, I/O-bound apps.

### 2️⃣ The Event Loop (Architecture) 🔥
**Answer:**
The mechanism that orchestrates the single thread.
1.  **Call Stack**: Sync code runs here.
2.  **Microtask Queue**: **Promises** (`.then`, `await`), `process.nextTick`. **High Priority**.
3.  **Macrotask Queue**: `setTimeout`, `setInterval`, I/O callbacks.
4.  **Loop**:
    *   Execute Stack.
    *   Stack empty? -> Run ALL Microtasks.
    *   Run ONE Macrotask.
    *   Repeat.

### 3️⃣ `process.nextTick` vs `setImmediate`
**Answer:**
*   **`process.nextTick`**: Runs **immediately** after the current operation completes, BEFORE the Event Loop continues. (Use with caution, can block I/O).
*   **`setImmediate`**: Runs on the next iteration of the Event Loop (Check phase), after I/O callbacks.

---

## 🟡 Part 2: Express.js & REST APIs

### 4️⃣ Express Middleware Pattern
**Answer:**
Middleware are functions that have access to `req`, `res`, and `next()`.
*   **Applications:** Logging (`morgan`), Parsing (`body-parser`), Auth, Error Handling.
*   **Error Middleware:** Must have **4 arguments**.
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Broken!');
});
```

### 5️⃣ REST vs GraphQL
**Answer:**
*   **REST**: Resource-based. Multiple endpoints (`/users`, `/posts`). Over-fetching (getting too much data) or Under-fetching (need multiple requests) is common.
*   **GraphQL**: Query-based. Single endpoint (`/graphql`). Client asks for exactly what it needs.
    *   **Use REST**: Simple apps, caching/CDN needed, public APIs.
    *   **Use GraphQL**: Complex relational data, mobile apps needing bandwidth efficiency.

### 6️⃣ PUT vs PATCH
**Answer:**
*   **PUT**: Replaces the **entire** resource (Send full object).
*   **PATCH**: Partial update (Send only changed fields).

---

## 🔵 Part 3: Auth, Security & Performance

### 7️⃣ Authentication (JWT) Flow
**Answer:**
1.  **Client**: Sends `username/password`.
2.  **Server**: Verifies DB. Signs a **JWT** (JSON Web Token) with a `secret`.
3.  **Token**: Sent back to Client. stored in `localStorage` or `HttpOnly Cookie`.
4.  **Next Request**: Client sends `Authorization: Bearer <token>`.
5.  **Server Middleware**: Verifies signature. If valid, attaches user to `req.user`.

### 8️⃣ Common Security Vulnerabilities
**Answer:**
1.  **SQL Injection**: Malicious SQL code in inputs. **Fix**: Use Parameterized Queries (ORMs do this).
2.  **XSS (Cross-Site Scripting)**: Scripts running in user browser. **Fix**: Sanitize inputs, Use Headers like CSP.
3.  **CSRF**: Unwanted actions on authenticated site. **Fix**: CSRF Tokens.
4.  **DDoS**: **Fix**: Rate Limiting (`express-rate-limit`).

### 9️⃣ How to scale Node.js? (Clustering)
**Answer:**
Node is single-threaded. To use a Multi-Core CPU:
1.  **Cluster Module**: Fork the process into workers (1 per CPU core).
    *   Main process (Master) listens to port, distributes to Workers.
2.  **PM2**: Process Manager. `pm2 start app.js -i max`. Auto-restarts crashes and handles clustering.
3.  **Horizontal Scaling**: Add more servers behind a Load Balancer (Nginx / AWS ALB).

**Cluster Module Code Example:**
```javascript
const cluster = require('cluster');
const http = require('http');
const os = require('os');

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Primary ${process.pid} is running. Forking ${numCPUs} workers.`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Forking a new one.`);
    cluster.fork(); // Auto-restart crashed workers
  });
} else {
  // Workers can share any TCP connection
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`Hello from Worker ${process.pid}\n`);
  }).listen(8000);

  console.log(`Worker ${process.pid} started`);
}
```

### 🔟 Dealing with CPU-Intensive Tasks
**Answer:**
**Don't** block the Event Loop.
1.  **Worker Threads**: `worker_threads` module runs JS in parallel threads (Memory shared).
2.  **Child Process**: `spawn()` or `fork()` a separate process (e.g., Python script for Data Science).
3.  **Microservices**: Offload heavy processing (Video encoding, PDF gen) to a separate service/queue (RabbitMQ/Redis).

### 1️⃣0️⃣ Streams – Handling Large Data
**Answer:**
Streams process data piece-by-piece (chunks) instead of loading everything into memory at once. Essential for large files.

**Stream Types:** `Readable`, `Writable`, `Duplex`, `Transform`.

**Example: Reading a Large File**
```javascript
const fs = require('fs');
const readStream = fs.createReadStream('large-file.csv', { encoding: 'utf8' });

readStream.on('data', (chunk) => {
  console.log(`Received ${chunk.length} bytes of data.`);
  // Process chunk here (e.g., parse CSV rows)
});

readStream.on('end', () => {
  console.log('Finished reading file.');
});

readStream.on('error', (err) => {
  console.error('Error reading file:', err);
});
```

**Piping Streams:**
```javascript
const fs = require('fs');
const zlib = require('zlib');

// Read file -> Compress -> Write to new file
fs.createReadStream('input.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('input.txt.gz'));
```


---

## 🔴 Part 4: Real-World Backend Story 📖

### 1️⃣1️⃣ "Tell me about a time you optimized a slow API?" (The STAR Story)
**Situation:**
"We had a `GET /dashboard` API taking **4 seconds** to load. It aggregated data from 3 different microservices (User, Orders, Payments) sequentially."

**Task:**
"Reduce response time to under **500ms**."

**Action:**
1.  **Parallelization:** Switched from `await service1(); await service2();` to `Promise.all([s1(), s2()])`. Cost went from `A+B+C` to `Max(A,B,C)`.
2.  **Caching:** Added **Redis**. Cached the aggregated dashboard JSON for 60 seconds.
3.  **Database Indexing:** Found a Slow Query on the Orders table. Added a composite index on `(userId, status)`.
4.  **Compression:** Enabled Gzip compression in Express (`compression` middleware).

**Result:**
*   Response time dropped to **200ms**.
*   Database load decreased by 70% due to Redis.

### 1️⃣2️⃣ Deployment & CI/CD Flow
**Answer:**
1.  **Push Code**: GitHub.
2.  **CI (GitHub Actions)**: Runs `npm test`, `npm audit` (security check).
3.  **Build**: Docker Image created (`Dockerfile`).
4.  **Registry**: Pushed to AWS ECR (Elastic Container Registry).
5.  **Deploy**: AWS ECS (Elastic Container Service) pulls image and updates the tasks.
6.  **Environment**: Secrets loaded from AWS Parameter Store (Not `.env` file).

### 1️⃣3️⃣ Memory Leaks: How to debug?
**Answer:**
**Symptoms**: RAM usage keeps growing until crash (OOM).
**Tools**: Chrome DevTools (using `--inspect`), Heap Snapshots.
**Common Causes**:
1.  **Global Variables**: Arrays that never get cleared.
2.  **Closures**: Holding reference to large objects.
3.  **Event Listeners**: Not removing listeners on connection close.

---

## 🔥 Part 5: Rapid Fire (Senior Check)

*   **`npm` vs `yarn` vs `pnpm`?**
    *   **pnpm** is fastest (uses hard links, saves disk space). `npm` is default.
*   **What is a Stream?**
    *   Handling data piece-by-piece (chunks) instead of all at once. Essential for large files (Video streaming, huge CSV parsing).
*   **CommonJS vs ESM?**
    *   **CommonJS**: `require()` / `module.exports`. OLD. Dynamic/Sync.
    *   **ESM**: `import` / `export`. NEW standard. Static/Async.
*   **Status 401 vs 403?**
    *   **401 (Unauthorized)**: I don't know who you are (Login failed).
    *   **403 (Forbidden)**: I know who you are, but you rarely allowed to do this (Admin only).
