# Mid-Level Interview Questions (2-4 Years)

> At this level, you should explain HOW things work, not just WHAT they are.

---

## 📚 Table of Contents
- [JavaScript Implementation](#javascript-implementation)
- [Angular Mechanics](#angular-mechanics)
- [Node.js Under the Hood](#nodejs-under-the-hood)
- [MongoDB Patterns](#mongodb-patterns)

---

## JavaScript Implementation

### Q1: Explain the `this` keyword and its binding rules.

**Answer:**

`this` depends on HOW a function is called, not where it's defined.

**The 4 Rules (in priority order):**

1. **new binding** (highest)
```javascript
function Person(name) {
  this.name = name;
}
const p = new Person('Rahul');  // this = new object
```

2. **Explicit binding** (call, apply, bind)
```javascript
function greet() { console.log(this.name); }
greet.call({ name: 'Rahul' });  // this = first argument
```

3. **Implicit binding** (method call)
```javascript
const obj = { name: 'Rahul', greet() { console.log(this.name); } };
obj.greet();  // this = obj
```

4. **Default binding** (lowest)
```javascript
function show() { console.log(this); }
show();  // this = window (non-strict) or undefined (strict)
```

**Arrow functions:** Don't have own `this`, inherit from enclosing scope.

---

### Q2: Explain the event loop with microtasks and macrotasks.

**Answer:**

```
Call Stack → Empty?
     ↓
Microtask Queue (process ALL)
  - Promise.then()
  - queueMicrotask()
     ↓
Macrotask Queue (process ONE)
  - setTimeout()
  - setInterval()
  - I/O
     ↓
Repeat
```

```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');

// Output: 1, 4, 3, 2
// Sync first, then microtasks, then macrotasks
```

---

### Q3: What is prototype chain? How does inheritance work?

**Answer:**

Every object has a hidden `[[Prototype]]` link to another object.

```javascript
const animal = { eats: true };
const dog = Object.create(animal);  // dog → animal → Object.prototype → null

console.log(dog.eats);  // true (found on prototype)

// With constructor functions
function Dog(name) {
  this.name = name;
}
Dog.prototype.bark = function() {
  return 'Woof!';
};

const rex = new Dog('Rex');
rex.bark();  // Found on Dog.prototype
```

**Lookup order:** Own property → Prototype → Prototype's prototype → ... → null

---

### Q4: Implement these array methods from scratch.

**Answer:**

```javascript
// map
Array.prototype.myMap = function(callback) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    result.push(callback(this[i], i, this));
  }
  return result;
};

// filter
Array.prototype.myFilter = function(callback) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (callback(this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};

// reduce
Array.prototype.myReduce = function(callback, initialValue) {
  let accumulator = initialValue;
  let startIndex = 0;
  
  if (initialValue === undefined) {
    accumulator = this[0];
    startIndex = 1;
  }
  
  for (let i = startIndex; i < this.length; i++) {
    accumulator = callback(accumulator, this[i], i, this);
  }
  return accumulator;
};
```

---

## Angular Mechanics

### Q5: Explain Angular's dependency injection system.

**Answer:**

DI provides class dependencies instead of creating them manually.

**Provider registration:**
```typescript
// 1. providedIn (tree-shakable)
@Injectable({ providedIn: 'root' })
export class UserService {}

// 2. In NgModule
@NgModule({
  providers: [UserService]
})

// 3. In Component (new instance per component)
@Component({
  providers: [UserService]
})
```

**Injector hierarchy:**
```
Root Injector (providedIn: 'root')
     ↓
Module Injector (NgModule providers)
     ↓
Element Injector (Component providers)
```

**Injection tokens:**
```typescript
const API_URL = new InjectionToken<string>('api.url');

@NgModule({
  providers: [{ provide: API_URL, useValue: 'https://api.example.com' }]
})

// Inject
constructor(@Inject(API_URL) private apiUrl: string) {}
```

---

### Q6: What are the differences between Observables and Promises?

**Answer:**

| Feature | Observable | Promise |
|---------|------------|---------|
| Values | Multiple over time | Single value |
| Execution | Lazy (on subscribe) | Eager (immediate) |
| Cancellation | Unsubscribe | Cannot cancel |
| Operators | Rich (map, filter, etc.) | Limited (.then) |
| Sync/Async | Can be either | Always async |

```typescript
// Observable: multiple values, lazy
const obs$ = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
});
obs$.subscribe(console.log);  // Runs on subscribe

// Promise: single value, eager
const promise = new Promise(resolve => {
  resolve(1);  // Runs immediately
});
```

---

### Q7: How does Angular change detection work?

**Answer:**

1. **Zone.js** patches async APIs (setTimeout, XHR, etc.)
2. Any async operation triggers change detection
3. Angular walks the component tree
4. Compares current vs previous values
5. Updates DOM where needed

**OnPush Optimization:**
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

OnPush only checks when:
- Input reference changes
- Event in component/child
- Async pipe emits
- Manual markForCheck()

---

### Q8: Explain Angular lifecycle hooks.

**Answer:**

```typescript
export class MyComponent implements OnInit, OnDestroy {
  @Input() data: any;
  
  // 1. Constructor (don't use for logic)
  constructor() {}
  
  // 2. After first input binding
  ngOnChanges(changes: SimpleChanges) {}
  
  // 3. After first ngOnChanges (use for initialization)
  ngOnInit() {}
  
  // 4. Every change detection
  ngDoCheck() {}
  
  // 5. After content projection
  ngAfterContentInit() {}
  ngAfterContentChecked() {}
  
  // 6. After view init
  ngAfterViewInit() {}
  ngAfterViewChecked() {}
  
  // 7. Cleanup (unsubscribe, remove listeners)
  ngOnDestroy() {}
}
```

**Most used:** `ngOnInit` (initialization), `ngOnDestroy` (cleanup), `ngOnChanges` (react to inputs)

---

## Node.js Under the Hood

### Q9: Explain the Node.js event loop phases.

**Answer:**

```
┌───────────────────────────┐
│        timers             │  ← setTimeout, setInterval
├───────────────────────────┤
│     pending callbacks     │  ← I/O callbacks deferred
├───────────────────────────┤
│       idle, prepare       │  ← internal
├───────────────────────────┤
│          poll             │  ← retrieve I/O events
├───────────────────────────┤
│         check             │  ← setImmediate
├───────────────────────────┤
│    close callbacks        │  ← socket.on('close')
└───────────────────────────┘

Between phases: process.nextTick() and Promise microtasks
```

**Key rule:** `setImmediate` vs `setTimeout(0)` — order varies unless inside I/O callback (then immediate first).

---

### Q10: How does middleware work in Express?

**Answer:**

Middleware are functions with access to `(req, res, next)`.

```javascript
// Execution order
app.use(logger);      // 1. Log request
app.use(authenticate); // 2. Check auth
app.use(parseBody);    // 3. Parse JSON

app.get('/', handler); // 4. Handle route

app.use(notFound);     // 5. 404 handler
app.use(errorHandler); // 6. Error handler (4 params)

// Middleware example
function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();  // MUST call next() to continue
}

// Error middleware (4 parameters)
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: 'Something broke' });
}
```

---

## MongoDB Patterns

### Q11: When do you embed vs reference in MongoDB?

**Answer:**

**Embed when:**
- One-to-few relationship
- Data accessed together
- Data doesn't grow unboundedly

```javascript
// Embed: user with addresses (few, always accessed together)
{
  name: "Rahul",
  addresses: [
    { type: "home", city: "Mumbai" }
  ]
}
```

**Reference when:**
- One-to-many (unbounded)
- Many-to-many
- Data accessed independently

```javascript
// Reference: blog with comments (could be thousands)
// Posts collection
{ _id: 1, title: "My Post" }

// Comments collection (separate)
{ postId: 1, text: "Great!" }
```

---

### Q12: Explain MongoDB aggregation pipeline.

**Answer:**

Aggregation processes documents through stages.

```javascript
db.orders.aggregate([
  // Stage 1: Filter
  { $match: { status: "completed" } },
  
  // Stage 2: Group and calculate
  { $group: {
      _id: "$customerId",
      totalSpent: { $sum: "$amount" },
      orderCount: { $sum: 1 }
  }},
  
  // Stage 3: Sort
  { $sort: { totalSpent: -1 } },
  
  // Stage 4: Limit
  { $limit: 10 },
  
  // Stage 5: Lookup (JOIN)
  { $lookup: {
      from: "customers",
      localField: "_id",
      foreignField: "_id",
      as: "customer"
  }}
]);
```

**Common stages:** $match, $group, $project, $sort, $limit, $lookup, $unwind

---

## 🎯 Tips for Mid-Level Interviews

1. **Explain the "why"** — Not just what, but why it works that way
2. **Discuss trade-offs** — Every choice has pros/cons
3. **Use technical vocabulary** — Show you understand internals
4. **Prepare code examples** — Be ready to implement
5. **Ask about their stack** — Shows interest and helps you answer better

---

**Next**: [Senior Level (4+ Years)](../senior-4-plus-years/)
