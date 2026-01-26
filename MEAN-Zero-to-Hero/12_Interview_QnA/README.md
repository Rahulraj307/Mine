# 12 Interview Q&A Master List

> **Goal**: Your last-minute revision handbook. Sorted by role depth.

---

## 🟢 Fresher (0-2 Years)
**Goal**: Syntax, Basic Concepts, "What is X?"

### HTML/CSS
1.  **Q: Box Model?**
    *   A: Content + Padding + Border + Margin. `box-sizing: border-box` makes width include padding/border.
2.  **Q: `display: flex` vs `grid`?**
    *   A: Flex is 1D (Row/Col). Grid is 2D.
3.  **Q: Semantic HTML?**
    *   A: Using tags with meaning (`<nav>`, `<article>`) for a11y and SEO.
4.  **Q: Specificity?**
    *   A: Inline > ID > Class > Tag.

### JavaScript
1.  **Q: `let` vs `var` vs `const`?**
    *   A: `var` is function scoped & hoisted. `let/const` are block scoped. `const` cannot be reassigned.
2.  **Q: `==` vs `===`?**
    *   A: `==` coerces type. `===` checks both value and type.
3.  **Q: What is a Promise?**
    *   A: An object representing async completion (Success/Failure).
4.  **Q: `null` vs `undefined`?**
    *   A: `undefined` = declared but not set. `null` = explicitly set to nothing.

---

## 🟡 Mid-Level (2-5 Years)
**Goal**: Internals, "How does X work?", Optimization.

### JavaScript
1.  **Q: Explain Event Loop.**
    *   A: Call Stack -> Web APIs -> Callback Queue -> Event Loop -> Stack. Microtasks (Promises) run before Macrotasks (setTimeout).
2.  **Q: What is a Closure?**
    *   A: A function bundled with its lexical environment. Usage: Data privacy, Currying.
3.  **Q: `this` keyword rules?**
    *   A: 1. `new` binding. 2. Explicit (`call/apply`). 3. Implicit (`obj.func()`). 4. Default (Global). Arrow functions inherit `this`.

### Angular
1.  **Q: Change Detection Strategy?**
    *   A: `Default` checks everything on every event. `OnPush` checks only on Input reference change or Async Pipe.
2.  **Q: RxJS `switchMap` vs `mergeMap`?**
    *   A: `switchMap` cancels previous. `mergeMap` runs parallel.
3.  **Q: Dependency Injection (Hierarchical)?**
    *   A: Reviewing providers up the DOM tree. Shadowing creating new instances.

---

## 🔴 Senior / Principal (5+ Years)
**Goal**: Design Choices, Trade-offs, "Why NOT use X?", System Design.

### Architecture
1.  **Q: Monolith vs Micro-Frontends?**
    *   A: Monolith is easier to manage/deploy. MFE allows independent team deployments but adds massive complexity (shared deps, consistency). Prefer Modular Monolith (Nx) first.
2.  **Q: Scaling Node.js?**
    *   A: Clustering (Vertical), Load Balancing (Horizontal), Caching (Redis), Offloading CPU tasks to Workers/Microservices.
3.  **Q: Handling 1 Million WebSocket connections?**
    *   A: Need multiple servers. Use Redis Pub/Sub to broadcast messages across servers. Max open file descriptors (ulimit) on OS level.

### Angular Enterprise
1.  **Q: Performance optimization in massive list?**
    *   A: Virtual Scroll (render viewport only), OnPush, splitting heavy processing to Web Workers (Partytown).
2.  **Q: Ngrx - to use or not?**
    *   A: **NOT** for simple CRUD. **YES** for shared state complexity, race condition handling, undo/redo requirements.

---

## 🧠 Behavioral (STAR Method)
**S**ituation, **T**ask, **A**ction, **R**esult.

1.  **Q: Tell me about a time you disagreed with a Tech Lead.**
    *   *Tip*: Focus on the data/proof you gathered, not the emotion. "I built a prototype to prove approach B improved LCP by 20%."
2.  **Q: A critical bug in production. What do you do?**
    *   *Tip*: 1. Rollback/Fix. 2. Communicate. 3. Post-Mortem (Root Cause Analysis).

