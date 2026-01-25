# Technical Checklist: Frontend & Angular

Master these keywords. You must be able to explain "What is it?", "Why use it?", and "How does it work?" for each.

## 1. JavaScript (ES6+) - The Foundation
*   **ExecutionContext & Scope:**
    *   Hoisting (Var vs Let/Const).
    *   Closures (Practical examples: Data privacy, currying).
    *   The `this` keyword (Implicit binding, Explicit binding with `call/apply/bind`, Arrow functions).
*   **Asynchronous JavaScript:**
    *   **The Event Loop:** Call Stack, Web APIs, Callback Queue vs. Microtask Queue (Promise resolution).
    *   **Promises:** `Promise.all` vs `Promise.allSettled` vs `Promise.race`.
    *   `async` / `await` error handling (try/catch).
*   **Core Objects:**
    *   Prototypes & Prototypal Inheritance.
    *   ES6 Modules (import/export) vs CommonJS.
    *   Deep Copy vs Shallow Copy (`JSON.parse` workaround vs `structuredClone`).

## 2. HTML & CSS - The Layout
*   **Semantics:** Why use `<article>` or `<nav>` over `<div>`? (SEO & Accessibility).
*   **CSS Architecture:**
    *   **Box Model:** `box-sizing: border-box`.
    *   **Flexbox:** Main axis vs Cross axis, `justify-content` vs `align-items`.
    *   **Grid:** `grid-template-columns`, `minmax()`, `gap`.
    *   **Specificity:** ID vs Class vs Tag. How to override styles without `!important`.
*   **Pre-processors (SCSS):** Mixins, Variables, Nesting practices (BEM methodology).

## 3. Angular - Deep Dive (The Senior Level)
*   **Change Detection:**
    *   **Zone.js:** How does Angular know when to update?
    *   **`ChangeDetectionStrategy.OnPush`:** How it improves performance by checking reference changes only.
    *   **`markForCheck()` vs `detectChanges()`**.
*   **RxJS in Angular:**
    *   **Observables vs Promises:** Cancelable, multiple values, lazy.
    *   **Flattening Operators:**
        *   `mergeMap`: Parallel execution (good for deletes).
        *   `switchMap`: Cancels previous inner observable (good for search/typeahead).
        *   `concatMap`: Sequential execution (good for ordered updates).
        *   `exhaustMap`: Ignores new emissions while busy (good for login buttons).
    *   **Subjects:** `Subject` vs `BehaviorSubject` (holds initial value) vs `ReplaySubject`.
*   **Architecture:**
    *   **Dependency Injection:** Hierarchical injectors, `@Host()`, `@Self()`, `@Optional()`. Also `providedIn: 'root'`.
    *   **Standalone Components:** The shift away from NgModules.
    *   **Signals:** The future of reactivity in Angular (writable signals, computed, effects).
*   **Routing & Security:**
    *   **Guards:** `CanActivate`, `CanDeactivate` (prevent leaving unsaved form).
    *   **Interceptors:** Global error handling, attaching Auth Tokens.
    *   **Lazy Loading:** `loadChildren` syntax.
