# RxJS Fundamentals

## 📚 Table of Contents
- [Beginner: What is RxJS?](#beginner-what-is-rxjs)
- [Intermediate: Core Operators](#intermediate-core-operators)
- [Advanced: Patterns & Error Handling](#advanced-patterns--error-handling)

---

## Beginner: What is RxJS?

### The Problem: Async Data Streams

```typescript
// How do you handle:
// 1. User typing in search box (debounced)
// 2. API call for each search term
// 3. Only show latest result
// 4. Handle errors
// 5. Cancel previous requests if new one comes

// With Promises: Complex and error-prone
// With RxJS: Elegant and declarative
```

### Observable: The Core Concept

An **Observable** is a lazy stream of values over time.

```typescript
import { Observable } from 'rxjs';

// Creating an Observable
const numbers$ = new Observable<number>(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
});

// Nothing happens until you subscribe!
numbers$.subscribe({
  next: value => console.log(value),
  error: err => console.error(err),
  complete: () => console.log('Done')
});
// Output: 1, 2, 3, Done
```

### Observable vs Promise

| Observable | Promise |
|------------|---------|
| Lazy (runs on subscribe) | Eager (runs immediately) |
| Multiple values | Single value |
| Cancellable | Not cancellable |
| Operators for transformation | Limited chaining |
| Can be sync or async | Always async |

### Common Creation Functions

```typescript
import { of, from, interval, fromEvent, timer } from 'rxjs';

// of: Create from values
const nums$ = of(1, 2, 3);

// from: Create from array, promise, or iterable
const arr$ = from([1, 2, 3]);
const promise$ = from(fetch('/api'));

// interval: Emit every N milliseconds
const ticks$ = interval(1000);  // 0, 1, 2, 3, ...

// timer: Wait, then emit (or start interval)
const delayed$ = timer(2000);          // Wait 2s, emit 0
const delayedInterval$ = timer(2000, 1000); // Wait 2s, then every 1s

// fromEvent: From DOM events
const clicks$ = fromEvent(document, 'click');
```

---

## Intermediate: Core Operators

### Operators: Transform Streams

```typescript
import { of } from 'rxjs';
import { map, filter, tap } from 'rxjs/operators';

of(1, 2, 3, 4, 5)
  .pipe(
    filter(x => x % 2 === 0),  // Keep even numbers
    map(x => x * 10),           // Multiply by 10
    tap(x => console.log('Value:', x))  // Side effect, doesn't change value
  )
  .subscribe(console.log);

// Output: Value: 20, 20, Value: 40, 40
```

### Categories of Operators

#### Transformation
```typescript
// map: Transform each value
of(1, 2, 3).pipe(map(x => x * 2))  // 2, 4, 6

// mergeMap (flatMap): Map + flatten (concurrent)
of('a', 'b').pipe(
  mergeMap(letter => http.get(`/api/${letter}`))
)  // All requests run in parallel

// switchMap: Map + flatten (cancel previous)
searchInput$.pipe(
  switchMap(term => http.get(`/search?q=${term}`))
)  // Only latest request matters

// concatMap: Map + flatten (sequential)
ids$.pipe(
  concatMap(id => http.get(`/api/${id}`))
)  // One at a time, in order
```

#### Filtering
```typescript
// filter
of(1, 2, 3, 4).pipe(filter(x => x > 2))  // 3, 4

// take: First N values
of(1, 2, 3, 4).pipe(take(2))  // 1, 2

// takeUntil: Until another Observable emits
clicks$.pipe(takeUntil(destroy$))  // Stop on destroy

// distinctUntilChanged: Skip consecutive duplicates
of(1, 1, 2, 2, 1).pipe(distinctUntilChanged())  // 1, 2, 1

// debounceTime: Wait for pause in emissions
keystrokes$.pipe(debounceTime(300))  // Emit after 300ms silence

// throttleTime: At most one emission per time period
clicks$.pipe(throttleTime(1000))  // Max 1 per second
```

#### Combination
```typescript
// combineLatest: Emit when any source emits (needs all sources to emit once first)
combineLatest([obs1$, obs2$]).pipe(
  map(([val1, val2]) => val1 + val2)
)

// merge: Combine into single stream
merge(clicks$, touches$)  // All events together

// forkJoin: Wait for all to complete (like Promise.all)
forkJoin([api1$, api2$, api3$]).subscribe(([res1, res2, res3]) => { ... })

// withLatestFrom: Combine with latest from other
clicks$.pipe(
  withLatestFrom(user$),
  map(([clickEvent, user]) => ({ clickEvent, user }))
)
```

### The Essential Pattern: switchMap

```typescript
// SEARCH: Type-ahead with cancellation
@Component({
  template: `
    <input [formControl]="searchControl">
    <div *ngFor="let result of results$ | async">{{ result }}</div>
  `
})
export class SearchComponent {
  searchControl = new FormControl('');
  
  results$ = this.searchControl.valueChanges.pipe(
    debounceTime(300),           // Wait for typing pause
    distinctUntilChanged(),       // Skip if same term
    switchMap(term =>             // Cancel previous request
      this.api.search(term)
    ),
    catchError(err => of([]))     // Handle errors
  );
}
```

---

## Advanced: Patterns & Error Handling

### Error Handling

```typescript
import { catchError, retry, retryWhen } from 'rxjs/operators';
import { throwError, of, timer } from 'rxjs';

// catchError: Handle and recover
http.get('/api').pipe(
  catchError(err => {
    console.error(err);
    return of(fallbackValue);  // Return fallback Observable
  })
);

// retry: Retry N times
http.get('/api').pipe(
  retry(3)  // Try up to 4 times total
);

// Exponential backoff
http.get('/api').pipe(
  retryWhen(errors => 
    errors.pipe(
      mergeMap((error, i) => {
        if (i >= 3) return throwError(() => error);
        return timer(Math.pow(2, i) * 1000);  // 1s, 2s, 4s
      })
    )
  )
);

// Error in stream doesn't kill the stream
source$.pipe(
  mergeMap(item => 
    processItem(item).pipe(
      catchError(err => of(null))  // Error on one item doesn't stop others
    )
  ),
  filter(result => result !== null)
);
```

### Subjects: Observables You Can Push To

```typescript
import { Subject, BehaviorSubject, ReplaySubject, AsyncSubject } from 'rxjs';

// Subject: Basic multicast
const subject = new Subject<number>();
subject.subscribe(val => console.log('A:', val));
subject.next(1);  // A: 1
subject.subscribe(val => console.log('B:', val));
subject.next(2);  // A: 2, B: 2

// BehaviorSubject: Has current value
const behavior = new BehaviorSubject<number>(0);  // Initial value required
behavior.subscribe(console.log);  // Immediately logs: 0
behavior.next(1);
behavior.getValue();  // 1

// ReplaySubject: Replays N last values
const replay = new ReplaySubject<number>(2);  // Buffer size
replay.next(1);
replay.next(2);
replay.next(3);
replay.subscribe(console.log);  // 2, 3 (last 2 values)

// AsyncSubject: Only emits last value, only on complete
const async = new AsyncSubject<number>();
async.subscribe(console.log);
async.next(1);  // Nothing yet
async.next(2);  // Nothing yet
async.complete();  // Now logs: 2
```

### Memory Leak Prevention

```typescript
// ❌ MEMORY LEAK: Never unsubscribes
export class BadComponent {
  ngOnInit() {
    this.service.getData().subscribe(data => {
      this.data = data;
    });
  }
}

// ✅ FIX 1: Manual unsubscribe
export class GoodComponent implements OnDestroy {
  private subscription = new Subscription();
  
  ngOnInit() {
    this.subscription.add(
      this.service.getData().subscribe(data => this.data = data)
    );
  }
  
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

// ✅ FIX 2: takeUntil (preferred)
export class BetterComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    this.service.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.data = data);
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// ✅ FIX 3: async pipe (best)
@Component({
  template: `<div>{{ data$ | async }}</div>`
})
export class BestComponent {
  data$ = this.service.getData();
  // async pipe handles subscribe AND unsubscribe!
}
```

### Hot vs Cold Observables

```typescript
// COLD: New execution for each subscriber
const cold$ = new Observable(subscriber => {
  console.log('Starting execution');
  subscriber.next(Math.random());
});

cold$.subscribe(console.log);  // Starting execution, 0.123
cold$.subscribe(console.log);  // Starting execution, 0.456

// HOT: Shared execution
const hot$ = cold$.pipe(share());

hot$.subscribe(console.log);  // Starting execution, 0.789
hot$.subscribe(console.log);  // 0.789 (same value, no new execution)
```

---

## 🎯 Interview Questions

### Fresher Level
1. What is an Observable?
2. What's the difference between Observable and Promise?
3. What is the `subscribe` method?

### Mid Level
1. Explain the difference between `mergeMap`, `switchMap`, and `concatMap`.
2. How do you prevent memory leaks with Observables?
3. What is the `async` pipe?

### Senior Level
1. Explain Hot vs Cold Observables.
2. When would you use `BehaviorSubject` vs `ReplaySubject`?
3. How would you implement retry with exponential backoff?

---

## 🧪 Common Interview Pattern

**Implement a type-ahead search with:**
- 300ms debounce
- Only search if term is 3+ characters
- Cancel previous requests
- Handle errors gracefully

```typescript
searchResults$ = this.searchInput.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  filter(term => term.length >= 3),
  switchMap(term => 
    this.searchService.search(term).pipe(
      catchError(() => of([]))
    )
  )
);
```

---

**Next**: [State Management](../06_state-management/)
