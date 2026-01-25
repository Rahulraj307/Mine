# Deep Dive: RxJS Mastery for Interviews

> **Goal:** Move beyond "I use subscribe" to "I manage asynchronous streams efficiently."

## 1. The Concept: ELI5
Think of an **Observable** like a **YouTube Channel**.
*   You (the Observer) hit **Subscribe**.
*   Videos (Data) come out over time.
*   You don't pull the data; it is pushed to you.

Think of **Operators** like a **Video Editor Pipeline**.
*   The raw footage (data) comes in.
*   We filter out bad takes (`filter`), add subtitles (`map`), or wait for the video to finish uploading (`delay`).
*   The subscriber sees the final polished result.

---

## 2. Flattening Operators (The "Map" Family)
This is the #1 Interview Question for Seniors. "What is the difference between mergeMap, switchMap, concatMap, and exhaustMap?"

### The Standard Interview Answer

*   **`mergeMap` (Parallel):** "It subscribes to every new inner observable immediately. It doesn't care about order. Use it for things like 'Delete' requests where you want to fire off 5 deletes at once and don't care which finishes first."
*   **`switchMap` (Latest Only):** "It unsubscribes from the *previous* inner observable as soon as a new one arrives. It switches to the new one. Use this for **Search/Typeahead**. If I type 'A', then 'AB', I don't care about the results for 'A' anymore, so cancel that request."
*   **`concatMap` (Sequential):** "It waits for the previous inner observable to complete before subscribing to the next one. It puts them in a queue. Use this for **Save operations** where order matters (e.g., Update User, THEN Update Settings)."
*   **`exhaustMap` (Ignore New):** "It ignores new emissions while the current inner observable is still running. Use this for **Login Buttons** to prevent a user from spamming the button and sending 10 login requests."

### Code Snippet (Whiteboard Friendly)

```typescript
import { fromEvent, interval } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

// Scenario: A Typeahead Search
// User clicks button -> We start an API call (simulated by interval)

const clicks$ = fromEvent(document, 'click');

const result$ = clicks$.pipe(
  // If user clicks again before 3s, the previous timer is CANCELLED.
  // We only care about the latest click.
  switchMap(() => interval(1000).pipe(take(3)))
);

result$.subscribe(x => console.log(x));
```

---

## 3. Subscription Management (Preventing Memory Leaks)

**The Problem:** If you `subscribe()` manually in a component and that component is destroyed (user navigates away), the subscription stays alive. It tries to update a view that doesn't exist. **Crash!** (or silent memory leak).

**The Solution:**

1.  **The "Async Pipe" (Best Practice):** Let Angular handle it in the template.
    ```html
    <div *ngIf="data$ | async as data">{{ data.name }}</div>
    ```
2.  **`takeUntil` Pattern (Manual Subscription):**
    ```typescript
    private destroy$ = new Subject<void>();

    ngOnInit() {
      this.data$.pipe(
        takeUntil(this.destroy$) // Auto-unsubscribe when destroy$ emits
      ).subscribe(data => this.handleData(data));
    }

    ngOnDestroy() {
      this.destroy$.next(); // Emit signal
      this.destroy$.complete();
    }
    ```
