# Senior Level Interview Questions (4+ Years)

> At this level, you're expected to architect solutions, evaluate trade-offs, and demonstrate leadership.

---

## 📚 Table of Contents
- [JavaScript Deep Dive](#javascript-deep-dive)
- [Angular Architecture](#angular-architecture)
- [Node.js & System Design](#nodejs--system-design)
- [Behavioral Questions](#behavioral-questions)

---

## JavaScript Deep Dive

### Q1: Explain the event loop, including microtasks and macrotasks.

**Expert Answer:**

The event loop is JavaScript's mechanism for handling asynchronous operations despite being single-threaded.

```
┌─────────────────────────────────────┐
│            Call Stack               │  ← Sync code runs here
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│         Microtask Queue             │  ← Promise.then, queueMicrotask
│   (Runs ALL before next macrotask)  │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│         Macrotask Queue             │  ← setTimeout, setInterval, I/O
│   (Runs ONE, then check microtasks) │
└─────────────────────────────────────┘
```

**Key insight for senior role:** I'd highlight how this affects performance:
- Infinite microtasks starve macrotasks (no rendering)
- Heavy sync work blocks the main thread
- Understanding this is crucial for debugging performance issues

---

### Q2: How can closures cause memory leaks? How do you debug them?

**Expert Answer:**

Closures capture their lexical scope. Memory leaks occur when:

```javascript
function leaky() {
  const hugeData = new Array(1000000).fill('x');
  
  return function inner() {
    // Even if inner doesn't USE hugeData,
    // some engines keep the entire scope
  };
}

// Common patterns that leak:
// 1. Event listeners not removed
// 2. Timers not cleared
// 3. Closures in module scope holding large objects
```

**Debugging approach:**
1. Chrome DevTools → Memory tab → Heap Snapshot
2. Compare snapshots before/after actions
3. Look for "Detached DOM" and large retained sizes
4. Use WeakMap/WeakRef for caches where appropriate

---

### Q3: Implement a debounce function that also has cancel and flush capabilities.

**Expert Answer:**

```javascript
function debounce(fn, delay) {
  let timeoutId = null;
  let lastArgs = null;
  let lastThis = null;
  
  function debounced(...args) {
    lastArgs = args;
    lastThis = this;
    
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(lastThis, lastArgs);
      lastArgs = lastThis = null;
    }, delay);
  }
  
  debounced.cancel = function() {
    clearTimeout(timeoutId);
    timeoutId = lastArgs = lastThis = null;
  };
  
  debounced.flush = function() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      fn.apply(lastThis, lastArgs);
      timeoutId = lastArgs = lastThis = null;
    }
  };
  
  return debounced;
}

// Usage
const save = debounce(saveToServer, 1000);
save(data);
// User clicks "Save Now"
save.flush();  // Immediate
// User navigates away
save.cancel(); // Don't save
```

---

## Angular Architecture

### Q4: How does Angular's change detection work? When would you use OnPush?

**Expert Answer:**

**Default Change Detection:**
- Zone.js patches async APIs (setTimeout, XHR, etc.)
- Every async operation triggers full tree check
- Angular compares current vs previous values

**OnPush Optimization:**
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

OnPush only runs change detection when:
1. Input reference changes (not mutation)
2. Event originates from component
3. Async pipe emits new value
4. Manual `markForCheck()` or `detectChanges()`

**When to use OnPush:**
- Performance-critical components
- Pure components (output depends only on inputs)
- Large lists with immutable data

**Gotchas:**
```typescript
// ❌ Won't update with OnPush
this.items.push(newItem);

// ✅ Must create new reference
this.items = [...this.items, newItem];
```

---

### Q5: Explain the injector hierarchy in Angular.

**Expert Answer:**

```
Platform Injector (Angular internal)
        ↓
Root Injector (providedIn: 'root')
        ↓
Module Injector (NgModule providers)
        ↓
Element Injector (Component providers)
        ↓
Child Component Injector
```

**Key concepts:**

1. **Singleton at root:** `providedIn: 'root'` = one instance app-wide
2. **Lazy module isolation:** Services in lazy modules get new instances
3. **Component-level override:** `providers: [Service]` creates per-component instance

**Resolution modifiers:**
```typescript
@Self()      // Only current injector
@SkipSelf()  // Start from parent
@Optional()  // Don't throw if not found
@Host()      // Stop at host component
```

**Real-world use case:**
```typescript
// Parent provides shared instance
@Component({
  providers: [FormService]  // One instance for form group
})
export class ParentFormComponent {}

// Children inherit same instance via @Host()
@Component({})
export class ChildInputComponent {
  constructor(@Host() private formService: FormService) {}
}
```

---

### Q6: How would you architect a large Angular application?

**Expert Answer:**

```
src/
├── app/
│   ├── core/                    # Singleton services, guards
│   │   ├── auth/
│   │   ├── http-interceptors/
│   │   └── core.module.ts
│   │
│   ├── shared/                  # Reusable components, pipes
│   │   ├── components/
│   │   ├── directives/
│   │   ├── pipes/
│   │   └── shared.module.ts
│   │
│   ├── features/                # Lazy-loaded feature modules
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── dashboard.routes.ts
│   │   │   └── dashboard.module.ts
│   │   └── users/
│   │
│   ├── state/                   # NgRx or signal store
│   │   ├── actions/
│   │   ├── reducers/
│   │   └── effects/
│   │
│   └── app.component.ts
```

**Principles:**
1. **Core module:** Import once in AppModule (guards, interceptors)
2. **Shared module:** Import in feature modules as needed
3. **Feature modules:** Lazy load for performance
4. **Smart/Dumb components:** Containers fetch data, presentational display
5. **State management:** NgRx for complex, signals for simpler apps

---

## Node.js & System Design

### Q7: How would you design a rate limiter for an API?

**Expert Answer:**

**Approach 1: Token Bucket (Recommended)**

```javascript
// Redis-based token bucket
async function rateLimit(userId, limit = 100, window = 60) {
  const key = `ratelimit:${userId}`;
  const now = Date.now();
  const windowStart = now - (window * 1000);
  
  // Remove old requests, add current, count
  const pipeline = redis.pipeline();
  pipeline.zremrangebyscore(key, 0, windowStart);
  pipeline.zadd(key, now, `${now}-${Math.random()}`);
  pipeline.zcard(key);
  pipeline.expire(key, window);
  
  const results = await pipeline.exec();
  const requestCount = results[2][1];
  
  if (requestCount > limit) {
    throw new RateLimitError();
  }
}
```

**Approach 2: Sliding Window Counter**
- Hybrid of fixed window and sliding
- Less memory than token bucket
- Good for high-traffic scenarios

**Considerations:**
- Distributed rate limiting requires Redis/central store
- User vs IP vs API key based limiting
- Graceful degradation (don't break if Redis down)
- Different limits for different endpoints

---

### Q8: How would you handle a memory leak in Node.js production?

**Expert Answer:**

**Detection:**
```javascript
// Monitor heap usage
setInterval(() => {
  const { heapUsed, heapTotal } = process.memoryUsage();
  console.log(`Heap: ${(heapUsed / 1024 / 1024).toFixed(2)}MB`);
}, 30000);
```

**Debugging steps:**
1. **Reproduce locally** with production-like load
2. **Heap snapshots:**
   ```javascript
   // Generate heap dump
   require('heapdump').writeSnapshot();
   ```
3. **Compare snapshots** in Chrome DevTools (Memory tab)
4. **Look for:** Growing arrays, detached DOM, closure leaks

**Common culprits:**
- Unbounded caches (use LRU with max size)
- Event listeners not removed
- Global variables accumulating data
- Closures in loops capturing scope

**Prevention:**
```javascript
// Use WeakMap for object metadata
const metadata = new WeakMap();
metadata.set(obj, { created: Date.now() });
// When obj is GC'd, metadata entry is too

// Bounded caches
const LRU = require('lru-cache');
const cache = new LRU({ max: 500 });
```

---

## Behavioral Questions

### Q9: Tell me about a time you had to make a significant architectural decision.

**STAR Format Answer:**

**Situation:**
"In my previous role, we had a monolithic Angular application serving 50+ features. Build times exceeded 10 minutes, and teams were stepping on each other's code."

**Task:**
"I was tasked with proposing and leading the migration strategy."

**Action:**
"I evaluated three options:
1. Continue with monolith + optimization
2. Module federation (micro-frontends)
3. Separate apps per team with shared library

I created a proof-of-concept with module federation, documented trade-offs:
- Complexity vs independence
- Bundle size vs code sharing
- Deployment flexibility vs coordination

Presented to stakeholders with data on build times and team velocity."

**Result:**
"We adopted module federation. Build times dropped to 2 minutes per feature. Team velocity increased 40%. I mentored 3 teams on the migration, which took 4 months total."

---

### Q10: How do you handle disagreements with team members about technical decisions?

**Framework Answer:**

"I approach technical disagreements as learning opportunities. My process:

1. **Understand their perspective fully** — Ask 'why' until I understand their reasoning
2. **State my concern clearly** — 'I'm worried about X because of past experience with Y'
3. **Focus on data** — Can we prototype both approaches? What do benchmarks show?
4. **Propose experiments** — 'Let's try this spike and compare'
5. **Disagree and commit** — If consensus isn't possible, support the team decision fully

Example: A colleague wanted to use GraphQL for a new API. I had concerns about caching complexity. We spent half a day prototyping. The results showed GraphQL's N+1 problem for our use case. We went with REST, but the colleague appreciated the fair evaluation."

---

## 🎯 Interview Tips for Senior Level

1. **Always discuss trade-offs** — Never say "X is best" without context
2. **Use real examples** — "In my experience..." adds credibility
3. **Acknowledge what you don't know** — "I haven't used Y, but my approach would be..."
4. **Think out loud** — The process matters as much as the answer
5. **Ask clarifying questions** — Senior engineers don't assume

---

**Next**: [System Design](../system-design/)
