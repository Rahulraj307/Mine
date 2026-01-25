# STAR Method Stories: The Sustaining Engineer

These stories are designed to show *depth*. They take "a bug ticket" and turn it into "an engineering triumph."

## Story 1: The Memory Leak (RxJS & DOM Clean-up)
**Theme:** *Deep knowledge of Angular Lifecycle & RxJS Subscriptions.*

*   **Situation:** We had a critical issue where our dashboard application would become progressively slower and eventually crash the browser after 2-3 hours of continuous use by our operations team.
*   **Task:** As the Sustaining Engineer lead, I was tasked with diagnosing this performance degradation which was affecting operational efficiency.
*   **Action:**
    *   I used Chrome DevTools **Heap Snapshot** to compare memory states and identified a massive accumulation of `Detached DOM Nodes`.
    *   The root cause was improper RxJS subscription management in our shared table components. We were manually subscribing in `ngOnInit` but failing to unsubscribe in `ngOnDestroy`.
    *   I refactored the codebase to use the **`async` pipe** wherever possible to handle auto-unsubscription. for manual subscriptions, I implemented the `takeUntil(destroy$)` pattern using a Subject to ensure every stream was cleanly terminated when the component destroyed.
*   **Result:** This eliminated the memory leak entirely. Application stability went from 3 hours to "indefinite," and I established a new linting rule to prevent unmanaged subscriptions in the future.

## Story 2: The Race Condition (Node.js Event Loop & Asynchrony)
**Theme:** *Backend Stability & Async Logic.*

*   **Situation:** Users were reporting random "data corruption" where their profile updates would sometimes save partial data or old data, but it only happened during peak traffic.
*   **Task:** I needed to identify why concurrent requests were interfering with each other in what should be a stateless API.
*   **Action:**
    *   I traced the logs and realized we had a global variable being used temporarily to store request state in one of our legacy middlewares—a classic singleton anti-pattern in Node.js. Because Node is single-threaded but non-blocking, concurrent requests were overwriting this variable before the first request finished its database operation.
    *   I refactored the middleware logic to keep all state local to the `req` object and passed context explicitly through the service layers.
    *   I also implemented a proper **Transaction** pattern in MongoDB to ensure atomicity for complex multi-document updates.
*   **Result:** Data integrity incidents dropped to zero. It helped the team understand the importance of statelessness in Node.js architecture.

## Story 3: The Circular Dependency (Dependency Injection & refactoring)
**Theme:** *Architecture & Modularization.*

*   **Situation:** Our build times were slowing down, and we started getting obscure "Provider not found" errors at runtime after a large merge, specifically affecting our Authentication service.
*   **Task:** I had to untangle a complex web of dependencies that was preventing the application from bootstrapping correctly.
*   **Action:**
    *   I analyzed the module imports and found a circular dependency: `AuthService` depended on `HttpClient`, which had an interceptor that depended casually back on `AuthService` to check tokens.
    *   I broke this cycle by extracting the token storage logic into a lightweight, standalone `TokenStorageService` that both the Interceptor and AuthService could import without depending on each other.
    *   I also aggressively moved us towards **Standalone Components** to reduce the complexity of our `NgModule` wiring.
*   **Result:** The application runtime errors happened immediately. It also reduced our bundle size because the tree-shaking was now working effectively on the decoupled modules.
