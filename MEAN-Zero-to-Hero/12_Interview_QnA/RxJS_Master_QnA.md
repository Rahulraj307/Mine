# 📘 MASTER INTERVIEW Q&A: RxJS (Zero to Hero)
> **Section 8: RxJS (Reactive Thinking for Angular – 2025)**
> From "What is an Observable?" to Operators, Subjects, and Memory Leak Prevention.

---

## 🟢 Part 1: The Core (Observables & Streams)

### 1️⃣ Observable vs Promise (The Classic)
**Answer:**
| Feature | Promise | Observable |
| :--- | :--- | :--- |
| **Values** | Single value | **Stream** of values (0, 1, or many) |
| **Execution** | **Eager** (runs immediately) | **Lazy** (runs on `subscribe`) |
| **Cancellation** | Not natively possible | `unsubscribe()` cancels execution |
| **Operators** | Limited (`.then`, `.catch`) | Rich library (`map`, `filter`, `switchMap`...) |

```typescript
// Promise: Eager, Single Value
const promise = new Promise(resolve => {
  console.log('Promise created!'); // Runs immediately
  resolve(1);
});

// Observable: Lazy, Stream
const observable = new Observable(subscriber => {
  console.log('Observable subscribed!'); // Runs only on subscribe
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
});
observable.subscribe(val => console.log(val));
```

### 2️⃣ Hot vs Cold Observables
**Answer:**
*   **Cold:** Producer is created *inside* the Observable. Each subscriber gets its own stream. (e.g., `HttpClient.get()` - each subscriber makes a new HTTP call).
*   **Hot:** Producer exists *outside* the Observable. All subscribers share the same stream. (e.g., Mouse clicks, WebSockets, Subjects).

### 3️⃣ Creating Observables
**Answer:**
*   **`of(...values)`**: Emits values synchronously.
*   **`from(iterable)`**: Converts an array, promise, or iterable.
*   **`interval(ms)`**: Emits sequential integers every X ms.
*   **`fromEvent(target, event)`**: Wraps DOM events.

---

## 🟡 Part 2: Subjects (Multicasting)

### 4️⃣ What is a Subject?
**Answer:**
A **Subject** is both an **Observable** (can be subscribed to) and an **Observer** (can `.next()` values into it). It's used for **multicasting** – pushing values to multiple subscribers.

### 5️⃣ Types of Subjects
**Answer:**
| Type | Behavior | Use Case |
| :--- | :--- | :--- |
| **`Subject`** | Subscribers only get values emitted *after* they subscribe. | Event bus, User actions. |
| **`BehaviorSubject`** | Requires initial value. Subscribers immediately get the *current* value. | Current user state, Theme preference. |
| **`ReplaySubject`** | Replays the last N values to new subscribers. | Cache, Audit logs. |
| **`AsyncSubject`** | Emits only the *last* value, and only on `complete()`. | Rarely used. |

```typescript
// BehaviorSubject Example
const user$ = new BehaviorSubject<User | null>(null); // Initial value

// In Auth Service
user$.next({ id: 1, name: 'Rahul' }); // Update state

// In Component (subscribes later)
user$.subscribe(user => console.log(user)); // Immediately gets { id: 1, name: 'Rahul' }
```

---

## 🔵 Part 3: Operators (The Power 🔥)

### 6️⃣ Transformation vs Flattening Operators
**Answer:**
*   **Transformation (`map`, `filter`):** Works on values directly.
*   **Flattening (`switchMap`, `mergeMap`):** Handles **inner Observables** (Observable of Observables).

### 7️⃣ The Flattening Operators (Must Memorize)
**Answer:**
These are used when one Observable triggers another (e.g., route param change → HTTP call).

| Operator | Behavior | Use Case |
| :--- | :--- | :--- |
| **`switchMap`** | **Cancels** previous inner Observable when new outer value arrives. | **Search typeahead**, GET requests. |
| **`mergeMap`** | Runs all inner Observables **in parallel**. | Fire-and-forget (logging, analytics). |
| **`concatMap`** | Runs inner Observables **serially** (queues them). | **POST/PUT requests** (order matters). |
| **`exhaustMap`** | **Ignores** new outer values while inner is running. | Login button (prevent double-click). |

**Typeahead Search Example:**
```typescript
searchInput$.pipe(
  debounceTime(300),         // Wait for user to stop typing
  distinctUntilChanged(),    // Ignore if same as last search
  switchMap(term => this.api.search(term)) // Cancel old request, start new
).subscribe(results => this.results = results);
```

### 8️⃣ Combination Operators
**Answer:**
| Operator | Behavior |
| :--- | :--- |
| **`combineLatest`** | Emits when *any* source emits, after all have emitted at least once. Gives latest from each. |
| **`forkJoin`** | Waits for *all* sources to `complete()`. Gives the last value from each. Like `Promise.all`. |
| **`withLatestFrom`** | When primary emits, also grab latest from secondary. |

```typescript
// forkJoin: Wait for multiple API calls
forkJoin([this.api.getUser(), this.api.getOrders()])
  .subscribe(([user, orders]) => { ... });
```

---

## 🔴 Part 4: Memory Leak Prevention (Critical for Angular)

### 9️⃣ Why Subscriptions Leak
**Answer:**
If you subscribe to a long-lived Observable (e.g., `interval`, `BehaviorSubject` in a service) inside a component, the subscription keeps running **even after the component is destroyed**, consuming memory and causing bugs.

### 🔟 Solutions
**Answer:**

#### Method 1: `async` Pipe (Best for Templates)
The pipe handles subscribe/unsubscribe automatically.
```html
<div *ngFor="let user of users$ | async">{{ user.name }}</div>
```

#### Method 2: `takeUntil` Pattern (Best for Component Logic)
```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.dataService.getData().pipe(
    takeUntil(this.destroy$) // <-- The magic
  ).subscribe(data => this.data = data);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

#### Method 3: `takeUntilDestroyed()` (Angular 16+)
```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

constructor() {
  this.dataService.getData().pipe(
    takeUntilDestroyed() // No need for ngOnDestroy!
  ).subscribe();
}
```

---

## 🔥 Part 5: Rapid Fire (Senior Check)

*   **`tap` vs `map`?**
    *   `map` transforms values. `tap` performs side effects (logging) without changing the value.
*   **`catchError` – how does it work?**
    *   Catches errors in the stream. Must return a new Observable to continue the stream (e.g., `of(defaultValue)`).
*   **`share` vs `shareReplay`?**
    *   `share`: Multicasts to late subscribers (they only get future values). `shareReplay(1)`: Replays the last emitted value to late subscribers (like `BehaviorSubject`).
*   **`first()` vs `take(1)`?**
    *   Functionally similar, but `first()` throws an error if the source completes without emitting.
