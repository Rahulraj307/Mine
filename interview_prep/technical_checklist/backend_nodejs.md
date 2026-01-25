# Technical Checklist: Node.js & Backend

Transitioning to Full Stack requires understanding the runtime, not just the syntax.

## 1. Node.js Internals
*   **The Single Thread:** Why doesn't Node block? (Non-blocking I/O).
*   **Event Loop Phases:** Timers, Pending Callbacks, Poll, Check (setImmediate), Close Callbacks.
*   **`process.nextTick` vs `setImmediate`:** Understanding execution order.
*   **Streams:**
    *   Readable, Writable, Duplex, Transform.
    *   Why use streams? (Memory efficiency for large files).
    *   Backpressure handling.
*   **Buffers:** Handling binary data.
*   **Events:** The `EventEmitter` class (Pub/Sub pattern).

## 2. Express.js & API Design
*   **Middleware Pattern:** How `next()` works. Error handling middleware (4 arguments).
*   **REST Standards:**
    *   HTTP Verbs (GET, POST, PUT vs PATCH, DELETE).
    *   Status Codes (200, 201, 400, 401 vs 403, 404, 500).
*   **Authentication & Security:**
    *   **JWT:** Header, Payload, Signature. Stateless auth.
    *   **OAuth2 flows** (conceptual).
    *   **Cors:** Cross-Origin Resource Sharing.
    *   **Helmet:** Securing HTTP headers.

## 3. Database (MongoDB)
*   **NoSQL vs SQL:** deeply nested data vs relational data.
*   **Aggregation Framework:** `$match`, `$group`, `$lookup` (Left join), `$project`.
*   **Indexing:** Compound indexes, TTL indexes (auto-delete), execution stats (`explain()`).
*   **Mongoose:** Schemas, Virtuals, Middleware (pre/post hooks).
