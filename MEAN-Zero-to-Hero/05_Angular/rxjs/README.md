# RxJS: Reactive Extensions for Angular

> **Goal**: Master Streams, Operators, and Reactive Thinking.

---

## 1️⃣ Concept Explanation

### Observable vs Promise
| Feature | Promise | Observable |
|---------|---------|------------|
| Values | Single Value | Multiple Values (Stream) |
| Execution | Eager (Runs immediately) | Lazy (Runs only on subscribe) |
| Cancellation | Not possible (natively) | Cancellable (`unsubscribe`) |
| Nature | Async only | Sync or Async |

### Hot vs Cold Observables
- **Cold**: Producer is created *inside* the subscription. (e.g., HTTP call). Unicast (1-to-1).
- **Hot**: Producer is created *outside*. (e.g., Mouse Clicks, WebSockets). Multicast (1-to-Many).

---

## 2️⃣ Code Examples

### ❌ Bad Example (Nested Subscribe - Callback Hell)
```typescript
this.route.params.subscribe(params => {
    this.http.get(`api/user/${params.id}`).subscribe(user => {
        this.http.get(`api/details/${user.detailId}`).subscribe(details => {
            console.log(details); // Nightmare
        });
    });
});
```

### ✅ Good Example (Flattening Operators)
```typescript
this.route.params.pipe(
    map(params => params.id),
    switchMap(id => this.http.get(`api/user/${id}`)),
    switchMap(user => this.http.get(`api/details/${user.detailId}`)),
    catchError(err => of({ error: true })) // Error handling
).subscribe(details => console.log(details));
```

---

## 3️⃣ Internal Working: The Stream

1.  **Creation**: `of()`, `from()`, `new Observable()`.
2.  **Pipe**: Transformations move data through pure functions (operators).
3.  **Subscription**: The moment code actually runs.
4.  **Teardown**: Cleanup logic when unsubscribing.

---

## 4️⃣ Common Mistakes

### 🚨 Beginner Mistakes
- **Imperative Logic**: Storing state in variables inside `subscribe` instead of using `scan` or `reduce`.
- **Leaking Subscriptions**: Forgetting to unsubscribe in `ngOnDestroy`.

### ⚠️ Production Mistakes
- **Using switchMap for Writes**: `switchMap` cancels previous requests. If you use it for Saving data, and the user clicks "Save" twice, the first save might be cancelled (Data Loss). Use `concatMap` or `mergeMap` for writes.

---

## 5️⃣ Optimization & Best Practices

### Memory Leak Prevention
1.  **Async Pipe**: `{{ stream$ | async }}` (Handles unsubscribing auto-magically).
2.  **TakeUntil Pattern**:
    ```typescript
    private destroy$ = new Subject<void>();
    ngOnDestroy() { this.destroy$.next(); }
    
    stream$.pipe(takeUntil(this.destroy$)).subscribe();
    ```

### Flattening Strategies
- **switchMap**: Latest wins. (Search, GET requests).
- **mergeMap**: Parallel. (Fire and forget).
- **concatMap**: Serial/Queue. (Save requests, Order matters).
- **exhaustMap**: Ignore new until current fetches. (Login button).

---

## 6️⃣ Interview QnA

### Beginner
**Q: Map vs SwitchMap?**
A: `map` transforms values (1 -> 2). `switchMap` transforms values into *Observables* and switches to the new inner observable.

### Intermediate
**Q: What is a Subject?**
A: Special Observable that is also an Observer. You can `next()` values into it. Multicast by default.

### Scroll-Scenario
**Q: Implement a Type-Ahead Search.**
A:
```typescript
searchTerm$.pipe(
    debounceTime(300), // Wait for pause
    distinctUntilChanged(), // Ignore duplicates
    switchMap(term => this.api.search(term)) // Cancel old request
).subscribe();
```

---

## 7️⃣ Web References

- [Learn RxJS (Visuals)](https://www.learnrxjs.io/)
- [RxMarbles](https://rxmarbles.com/)
