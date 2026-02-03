# Angular Senior Interview Questions & Answers

> 50 comprehensive answers for Angular Senior/Principal Engineer interviews

---

## 🧠 Architecture & Design (1-10)

### 1. Explain Angular architecture in detail.

Angular follows a **component-based architecture** with these core building blocks:

```
┌──────────────────────────────────────────────────────┐
│                    Angular Application                │
├──────────────────────────────────────────────────────┤
│  Modules (NgModule)                                   │
│  ├── Declarations (Components, Directives, Pipes)    │
│  ├── Providers (Services via DI)                     │
│  ├── Imports (Other modules)                         │
│  └── Exports (Shared declarations)                   │
├──────────────────────────────────────────────────────┤
│  Components = Template + Class + Styles              │
│  ├── View (HTML template)                            │
│  ├── Logic (TypeScript class)                        │
│  └── Styling (CSS/SCSS)                              │
├──────────────────────────────────────────────────────┤
│  Services (Business logic, singleton by default)     │
│  Dependency Injection (Hierarchical injector tree)   │
├──────────────────────────────────────────────────────┤
│  Routing (URL → Component mapping)                   │
│  HTTP Client (Backend communication)                 │
│  Forms (Template-driven / Reactive)                  │
└──────────────────────────────────────────────────────┘
```

**Key Concepts:**
- **Decorators**: `@Component`, `@Injectable`, `@NgModule` add metadata
- **Change Detection**: Zone.js tracks async operations, triggers updates
- **Template Syntax**: Data binding, directives, pipes
- **Lifecycle Hooks**: ngOnInit, ngOnChanges, ngOnDestroy, etc.

---

### 2. How do you design a large-scale Angular application?

**Architecture Approach:**

```
src/
├── app/
│   ├── core/              # Singleton services, guards, interceptors
│   │   ├── services/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── core.module.ts
│   ├── shared/            # Reusable components, pipes, directives
│   │   ├── components/
│   │   ├── directives/
│   │   ├── pipes/
│   │   └── shared.module.ts
│   ├── features/          # Feature modules (lazy loaded)
│   │   ├── dashboard/
│   │   ├── users/
│   │   └── orders/
│   ├── layouts/           # Layout components
│   └── app.module.ts
├── assets/
└── environments/
```

**Key Principles:**
1. **Lazy Loading**: Load feature modules on demand
2. **Smart/Dumb Components**: Container components handle logic, presentational components are pure
3. **State Management**: NgRx or Signals for complex state
4. **Nx Monorepo**: For multi-app enterprise projects
5. **Barrel Exports**: index.ts for clean imports

---

### 3. How do you decide module boundaries in Angular?

**Criteria for Module Boundaries:**

| Module Type | Purpose | Loading |
|-------------|---------|---------|
| **CoreModule** | App-wide singletons (AuthService, HttpInterceptors) | Eager |
| **SharedModule** | Reusable UI (buttons, modals, pipes) | Imported by features |
| **Feature Modules** | Business domain (UserModule, OrderModule) | Lazy |
| **Routing Modules** | Route configuration | Per feature |

**Decision Factors:**
1. **Cohesion**: Group related functionality
2. **Reusability**: Shared components in SharedModule
3. **Load Performance**: Lazy load non-critical features
4. **Team Ownership**: One module per team
5. **Domain Boundaries**: Align with business domains

---

### 4. What is the difference between CoreModule and SharedModule?

| Aspect | CoreModule | SharedModule |
|--------|------------|--------------|
| **Purpose** | App-wide singleton services | Reusable components/UI |
| **Import** | Only in AppModule (once) | In every feature module |
| **Contains** | Services, guards, interceptors | Components, directives, pipes |
| **Providers** | Yes (singleton) | No (or forRoot pattern) |
| **Exports** | Usually nothing | Everything for reuse |

```typescript
// CoreModule - import ONCE in AppModule
@NgModule({
  providers: [AuthService, LoggerService],
  imports: [HTTP_INTERCEPTORS...]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parent: CoreModule) {
    if (parent) {
      throw new Error('CoreModule already loaded!');
    }
  }
}

// SharedModule - import in feature modules
@NgModule({
  declarations: [ButtonComponent, HighlightDirective, DatePipe],
  exports: [ButtonComponent, HighlightDirective, DatePipe, CommonModule]
})
export class SharedModule {}
```

---

### 5. How do you prevent multiple service instances in Angular?

**Methods to ensure singleton services:**

```typescript
// Method 1: providedIn: 'root' (Recommended)
@Injectable({ providedIn: 'root' })
export class AuthService {}

// Method 2: Provide in CoreModule only
@NgModule({
  providers: [AuthService]
})
export class CoreModule {}

// Method 3: forRoot() pattern for modules with providers
@NgModule({})
export class MyModule {
  static forRoot(): ModuleWithProviders<MyModule> {
    return {
      ngModule: MyModule,
      providers: [MyService]
    };
  }
}

// Method 4: Guard against multiple imports
constructor(@Optional() @SkipSelf() parent: CoreModule) {
  if (parent) throw new Error('Already loaded!');
}
```

---

### 6. Explain feature modules vs lazy-loaded modules.

**Feature Module**: Organizes related functionality
```typescript
@NgModule({
  declarations: [UserListComponent, UserDetailComponent],
  imports: [CommonModule, SharedModule, UserRoutingModule]
})
export class UserModule {}
```

**Lazy-Loaded Module**: Loads on demand via router
```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'users',
    loadChildren: () => import('./features/users/user.module')
      .then(m => m.UserModule)
  },
  // Angular 17+ with standalone
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component')
  }
];
```

**Benefits of Lazy Loading:**
- Smaller initial bundle
- Faster first load
- Code splitting
- Load only what user needs

---

### 7. How do you structure Angular apps in micro-frontend architecture?

```
┌─────────────────────────────────────────────────┐
│              Shell Application                   │
│  (Router, Authentication, Layout)               │
├─────────────────────────────────────────────────┤
│    ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│    │  MFE 1   │  │  MFE 2   │  │  MFE 3   │    │
│    │ Orders   │  │ Products │  │ Reports  │    │
│    │ (Team A) │  │ (Team B) │  │ (Team C) │    │
│    └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────┘
```

**Approaches:**
1. **Module Federation** (Webpack 5): Share code at runtime
2. **Single-SPA**: Framework-agnostic orchestration
3. **iframes**: Simple but limited
4. **Web Components**: Custom elements

**Key Considerations:**
- Shared dependencies (Angular, RxJS)
- Communication between MFEs (Custom events, shared state)
- Routing coordination
- Consistent styling

---

### 8. How does Single-SPA / Module Federation work with Angular?

**Module Federation (Webpack 5):**
```javascript
// Host (shell) webpack.config.js
new ModuleFederationPlugin({
  remotes: {
    mfeOrders: 'mfeOrders@http://localhost:3001/remoteEntry.js'
  },
  shared: ['@angular/core', '@angular/common', 'rxjs']
});

// Remote (MFE) webpack.config.js
new ModuleFederationPlugin({
  name: 'mfeOrders',
  filename: 'remoteEntry.js',
  exposes: {
    './OrdersModule': './src/app/orders/orders.module.ts'
  },
  shared: ['@angular/core', '@angular/common', 'rxjs']
});
```

**Single-SPA:**
```typescript
// Main config
registerApplication({
  name: 'orders',
  app: () => System.import('orders'),
  activeWhen: '/orders'
});

// Angular MFE bootstrap
const lifecycles = singleSpaAngular({
  bootstrapFunction: () => platformBrowserDynamic()
    .bootstrapModule(AppModule),
  template: '<app-root />'
});
```

---

### 9. How do you handle cross-cutting concerns in Angular?

**Cross-cutting concerns**: Logging, authentication, error handling, caching

**Solutions:**

```typescript
// 1. HTTP Interceptors
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', 'Bearer token')
    });
    return next.handle(authReq);
  }
}

// 2. Error Handler
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any) {
    console.error('Global error:', error);
    // Log to service, show notification
  }
}

// 3. Route Guards
canActivate: [AuthGuard, RoleGuard]

// 4. Decorators (for logging)
function Log() {
  return function(target, key, descriptor) {
    const original = descriptor.value;
    descriptor.value = function(...args) {
      console.log(`Calling ${key} with`, args);
      return original.apply(this, args);
    };
  };
}
```

---

### 10. How do you enforce scalable folder structure?

**Use Nx or ESLint with boundaries:**

```typescript
// .eslintrc.json with @nx/enforce-module-boundaries
{
  "rules": {
    "@nx/enforce-module-boundaries": [
      "error",
      {
        "depConstraints": [
          { "sourceTag": "type:feature", "onlyDependOnLibsWithTags": ["type:shared", "type:util"] },
          { "sourceTag": "type:shared", "onlyDependOnLibsWithTags": ["type:util"] },
          { "sourceTag": "type:util", "onlyDependOnLibsWithTags": [] }
        ]
      }
    ]
  }
}
```

**Nx Tags:**
```json
// project.json
{
  "tags": ["type:feature", "scope:orders"]
}
```

**Naming Conventions:**
- `feature-*` for feature libraries
- `ui-*` for UI components
- `data-access-*` for state/API
- `util-*` for utilities

---

## ⚙️ Change Detection & Performance (11-20)

### 11. Explain Angular Change Detection in depth.

Angular's change detection is a mechanism to sync the component state with the DOM.

```
┌─────────────────────────────────────────────────────┐
│              Change Detection Flow                   │
├─────────────────────────────────────────────────────┤
│  1. Async Event (click, HTTP, timer)                │
│             ↓                                        │
│  2. Zone.js patches and intercepts                  │
│             ↓                                        │
│  3. Zone notifies Angular                           │
│             ↓                                        │
│  4. Angular runs CD from root component             │
│             ↓                                        │
│  5. Check each component (top-down)                 │
│             ↓                                        │
│  6. Update DOM if bindings changed                  │
└─────────────────────────────────────────────────────┘
```

**How it works:**
1. Angular compiles templates into JavaScript
2. Each binding becomes a comparison function
3. On CD cycle, Angular compares current vs previous values
4. If different, DOM is updated

```typescript
// Template: {{ user.name }}
// Compiled (simplified):
if (user.name !== previousName) {
  textNode.textContent = user.name;
  previousName = user.name;
}
```

---

### 12. What is Zone.js and why does Angular use it?

**Zone.js** is a library that patches async APIs to track execution context.

```javascript
// Zone.js patches these:
setTimeout, setInterval, Promise,
addEventListener, XMLHttpRequest, fetch,
requestAnimationFrame, MutationObserver...
```

**Why Angular uses it:**
1. **Automatic CD**: No need to manually trigger updates
2. **Async Tracking**: Know when async operations complete
3. **Context Preservation**: Track execution context

```typescript
// How Zone works
zone.run(() => {
  setTimeout(() => {
    // Zone knows this callback finished
    // Triggers change detection
  }, 100);
});

// Angular's NgZone
constructor(private ngZone: NgZone) {}

// Run outside Angular (no CD)
this.ngZone.runOutsideAngular(() => {
  setInterval(() => heavyCalculation(), 100);
});

// Run inside Angular (triggers CD)
this.ngZone.run(() => {
  this.data = newData;
});
```

---

### 13. Difference between Default and OnPush change detection.

| Aspect | Default | OnPush |
|--------|---------|--------|
| **Trigger** | Any async event | Input reference change, Events, Async pipe, Manual |
| **Performance** | Slower (checks all) | Faster (skips unchanged) |
| **Use Case** | Simple components | Performance-critical |
| **Immutability** | Not required | Required for inputs |

```typescript
// Default - checks every CD cycle
@Component({
  selector: 'app-default',
  template: '{{ data }}'
})
export class DefaultComponent {
  data = 'value';
}

// OnPush - skips if inputs unchanged
@Component({
  selector: 'app-onpush',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '{{ data }}'
})
export class OnPushComponent {
  @Input() data!: string;
}

// OnPush triggers when:
// 1. @Input reference changes (not mutation!)
// 2. Event handler in component
// 3. Async pipe emits
// 4. markForCheck() or detectChanges() called
```

---

### 14. When does Angular run change detection?

**CD runs when:**
1. **DOM Events**: click, input, keyup, mouseover
2. **HTTP Responses**: HttpClient observables
3. **Timers**: setTimeout, setInterval
4. **Promises**: Resolved/rejected
5. **Manual**: `detectChanges()`, `markForCheck()`

```typescript
// Force CD manually
constructor(private cdr: ChangeDetectorRef) {}

// Mark component and ancestors for check
this.cdr.markForCheck();

// Run CD for this component and children
this.cdr.detectChanges();

// Detach from CD tree (optimization)
this.cdr.detach();

// Reattach to CD tree
this.cdr.reattach();
```

---

### 15. How do you optimize Angular performance?

**1. Change Detection:**
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

**2. trackBy for ngFor:**
```html
<div *ngFor="let item of items; trackBy: trackById">
```
```typescript
trackById(index: number, item: Item): number {
  return item.id;
}
```

**3. Lazy Loading:**
```typescript
loadChildren: () => import('./feature/feature.module')
```

**4. Virtual Scrolling (CDK):**
```html
<cdk-virtual-scroll-viewport itemSize="50">
  <div *cdkVirtualFor="let item of items">{{ item }}</div>
</cdk-virtual-scroll-viewport>
```

**5. Async Pipe (auto-unsubscribe):**
```html
{{ data$ | async }}
```

**6. Pure Pipes (cached):**
```typescript
@Pipe({ name: 'filter', pure: true })
```

**7. NgZone optimization:**
```typescript
this.ngZone.runOutsideAngular(() => {
  // Heavy work without triggering CD
});
```

**8. Web Workers (heavy computation):**
```typescript
const worker = new Worker('./heavy.worker', { type: 'module' });
```

---

### 16. What are pure vs impure pipes?

| Aspect | Pure Pipe | Impure Pipe |
|--------|-----------|-------------|
| **Execution** | Only when input changes | Every CD cycle |
| **Memoization** | Yes (cached) | No |
| **Performance** | Better | Can be slow |
| **Use Case** | Transformations | Live data |

```typescript
// Pure Pipe (default) - called only when input changes
@Pipe({ name: 'filter', pure: true })
export class FilterPipe implements PipeTransform {
  transform(items: any[], filter: string): any[] {
    return items.filter(item => item.includes(filter));
  }
}

// Impure Pipe - called every CD cycle
@Pipe({ name: 'liveTime', pure: false })
export class LiveTimePipe implements PipeTransform {
  transform(): string {
    return new Date().toLocaleTimeString();
  }
}
```

**Warning**: Impure pipes can cause performance issues!

---

### 17. How do you avoid unnecessary re-renders?

```typescript
// 1. Use OnPush
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})

// 2. Immutable updates
this.items = [...this.items, newItem];

// 3. Signals (Angular 17+)
count = signal(0);
doubled = computed(() => this.count() * 2);

// 4. Memoization
const memoizedFn = memoize((a, b) => expensiveCalc(a, b));

// 5. Detach from CD
ngOnInit() {
  this.cdr.detach();
  setInterval(() => this.cdr.detectChanges(), 1000);
}

// 6. Pure pipes instead of methods in templates
// Bad: {{ getFullName() }}
// Good: {{ fullName$ | async }} or {{ user | fullName }}
```

---

### 18. What is trackBy and why is it important?

**Without trackBy**: Angular destroys and recreates ALL DOM elements when array reference changes.

**With trackBy**: Angular reuses existing DOM elements, only updates what changed.

```typescript
// Component
items = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' }
];

trackByFn(index: number, item: any): number {
  return item.id; // Unique identifier
}
```

```html
<!-- Without trackBy - slow -->
<li *ngFor="let item of items">{{ item.name }}</li>

<!-- With trackBy - fast -->
<li *ngFor="let item of items; trackBy: trackByFn">{{ item.name }}</li>

<!-- Angular 17+ -->
@for (item of items; track item.id) {
  <li>{{ item.name }}</li>
}
```

**Performance Impact**:
- 1000 items without trackBy: All 1000 DOM nodes recreated
- 1000 items with trackBy: Only changed items updated

---

### 19. How do you debug performance issues in Angular?

**1. Chrome DevTools Performance:**
- Record performance profile
- Look for long tasks, layout thrashing

**2. Angular DevTools:**
- Profiler tab shows CD cycles
- Component tree with render times

**3. Console logging:**
```typescript
ngDoCheck() {
  console.log('CD running on', this.constructor.name);
}
```

**4. EnableProdMode metrics:**
```typescript
import { enableProdMode } from '@angular/core';
enableProdMode();
```

**5. Source Map Explorer:**
```bash
npm run build -- --source-map
npx source-map-explorer dist/*.js
```

**6. Webpack Bundle Analyzer:**
```bash
ng build --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

---

### 20. How do you handle large lists (10k+ rows)?

**1. Virtual Scrolling (CDK):**
```typescript
import { ScrollingModule } from '@angular/cdk/scrolling';

<cdk-virtual-scroll-viewport itemSize="48" class="viewport">
  <div *cdkVirtualFor="let item of items; trackBy: trackByFn">
    {{ item.name }}
  </div>
</cdk-virtual-scroll-viewport>
```

**2. Pagination:**
```typescript
// Load chunks from server
loadPage(page: number, size: number): Observable<Page<Item>> {
  return this.http.get(`/api/items?page=${page}&size=${size}`);
}
```

**3. Infinite Scroll:**
```typescript
@HostListener('scroll', ['$event'])
onScroll(event: Event) {
  const element = event.target as HTMLElement;
  if (element.scrollHeight - element.scrollTop === element.clientHeight) {
    this.loadMore();
  }
}
```

**4. OnPush + trackBy:**
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

**5. Web Workers for filtering/sorting:**
```typescript
const worker = new Worker('./sort.worker');
worker.postMessage(largeArray);
```

---

## 🔄 RxJS & Reactive Programming (21-30)

### 21. Explain Observable vs Promise.

| Aspect | Observable | Promise |
|--------|------------|---------|
| **Values** | Multiple (stream) | Single |
| **Lazy** | Yes (only on subscribe) | No (eager) |
| **Cancellable** | Yes (unsubscribe) | No |
| **Operators** | 100+ (map, filter...) | Few (then, catch) |
| **Use Case** | Streams, events | Single async |

```typescript
// Promise - single value, eager
const promise = new Promise(resolve => {
  console.log('Executed immediately');
  resolve('value');
});

// Observable - stream, lazy
const observable = new Observable(sub => {
  console.log('Executed on subscribe');
  sub.next('value1');
  sub.next('value2');
  sub.complete();
});

observable.subscribe(x => console.log(x));
```

---

### 22. What are cold and hot observables?

**Cold Observable**: Creates new producer for each subscriber
```typescript
// Cold - each subscriber gets own execution
const cold$ = new Observable(sub => {
  sub.next(Math.random()); // Different for each subscriber
});

cold$.subscribe(x => console.log('Sub1:', x)); // 0.123
cold$.subscribe(x => console.log('Sub2:', x)); // 0.456
```

**Hot Observable**: Shares single producer
```typescript
// Hot - all subscribers share same stream
const subject = new Subject<number>();
subject.subscribe(x => console.log('Sub1:', x));
subject.subscribe(x => console.log('Sub2:', x));
subject.next(1); // Both receive 1

// Make cold observable hot
const hot$ = cold$.pipe(share());
```

---

### 23. Difference between Subject, BehaviorSubject, ReplaySubject.

| Type | Initial Value | Replay | Use Case |
|------|---------------|--------|----------|
| **Subject** | None | None | Events |
| **BehaviorSubject** | Required | Last 1 | Current state |
| **ReplaySubject** | None | N values | History |
| **AsyncSubject** | None | Last on complete | Final result |

```typescript
// Subject - no initial value, no replay
const subject = new Subject<number>();
subject.subscribe(x => console.log('Sub1:', x));
subject.next(1); // Sub1: 1
subject.subscribe(x => console.log('Sub2:', x));
subject.next(2); // Sub1: 2, Sub2: 2

// BehaviorSubject - has initial value, replays last
const behavior = new BehaviorSubject<number>(0);
behavior.subscribe(x => console.log('Sub1:', x)); // Sub1: 0
behavior.next(1); // Sub1: 1
behavior.subscribe(x => console.log('Sub2:', x)); // Sub2: 1

// ReplaySubject - replays N values
const replay = new ReplaySubject<number>(2); // Buffer size 2
replay.next(1);
replay.next(2);
replay.next(3);
replay.subscribe(x => console.log(x)); // 2, 3 (last 2)
```

---

### 24. Explain mergeMap vs switchMap vs concatMap vs exhaustMap.

| Operator | New Inner | Previous Inner | Order | Use Case |
|----------|-----------|----------------|-------|----------|
| **mergeMap** | Subscribe | Keep running | Parallel | Parallel requests |
| **switchMap** | Subscribe | Cancel | Latest only | Search/autocomplete |
| **concatMap** | Queue | Wait to complete | Sequential | Save operations |
| **exhaustMap** | Ignore | Keep running | First only | Submit button |

```typescript
// mergeMap - all run in parallel
clicks$.pipe(
  mergeMap(() => http.get('/api')) // All requests run
);

// switchMap - cancels previous
search$.pipe(
  switchMap(term => http.get(`/api?q=${term}`)) // Only latest
);

// concatMap - waits for previous
saves$.pipe(
  concatMap(data => http.post('/api', data)) // In order
);

// exhaustMap - ignores while busy
submit$.pipe(
  exhaustMap(data => http.post('/api', data)) // Ignores clicks while saving
);
```

---

### 25. When would you use switchMap over mergeMap?

**Use switchMap:**
- Search/autocomplete (only care about latest)
- Route navigation (cancel previous route data)
- API calls that obsolete previous calls

```typescript
// Search - switchMap cancels previous searches
this.searchControl.valueChanges.pipe(
  debounceTime(300),
  switchMap(term => this.searchService.search(term))
);
```

**Use mergeMap:**
- Multiple independent requests
- Fire-and-forget operations
- When you need ALL results

```typescript
// Upload multiple files - all in parallel
this.files$.pipe(
  mergeMap(file => this.uploadService.upload(file), 3) // Max 3 concurrent
);
```

---

### 26. What are higher-order observables?

**Higher-order Observable**: Observable that emits Observables

```typescript
// Higher-order: Observable<Observable<T>>
const clicks$ = fromEvent(button, 'click');
const requests$ = clicks$.pipe(
  map(() => http.get('/api')) // Each click creates inner Observable
);

// Flattening operators convert to first-order
const results$ = clicks$.pipe(
  switchMap(() => http.get('/api')) // Observable<T>
);
```

**Common patterns:**
```typescript
// Nested HTTP calls
getUser(id).pipe(
  switchMap(user => getOrders(user.id)) // Inner observable
);

// Multiple dependent calls
forkJoin({
  user: getUser(id),
  orders: getOrders(id)
});
```

---

### 27. How do you manage subscriptions properly?

```typescript
// Method 1: async pipe (auto-unsubscribe)
// Best for templates
{{ data$ | async }}

// Method 2: takeUntilDestroyed (Angular 16+)
data$ = this.http.get('/api').pipe(
  takeUntilDestroyed(this.destroyRef)
);

// Method 3: Subject with takeUntil
private destroy$ = new Subject<void>();

ngOnInit() {
  this.data$.pipe(
    takeUntil(this.destroy$)
  ).subscribe();
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}

// Method 4: Subscription collection
private subs = new Subscription();

ngOnInit() {
  this.subs.add(this.data$.subscribe());
  this.subs.add(this.other$.subscribe());
}

ngOnDestroy() {
  this.subs.unsubscribe();
}
```

---

### 28. What is async pipe and why is it important?

**async pipe** subscribes to Observable/Promise and:
1. Returns emitted value
2. Auto-unsubscribes on component destroy
3. Triggers CD when value emits

```typescript
// Component
@Component({
  template: `
    <div *ngIf="user$ | async as user">
      {{ user.name }}
    </div>
    
    <ul>
      <li *ngFor="let item of items$ | async">{{ item }}</li>
    </ul>
  `
})
export class UserComponent {
  user$ = this.http.get<User>('/api/user');
  items$ = this.store.select(selectItems);
}
```

**Benefits:**
- No manual subscribe/unsubscribe
- Works with OnPush
- Simpler code
- No memory leaks

---

### 29. Explain multicasting in RxJS.

**Multicasting**: Sharing a single subscription among multiple observers.

```typescript
// Without multicasting - 3 HTTP requests!
const data$ = http.get('/api');
data$.subscribe(a => console.log(a));
data$.subscribe(b => console.log(b));
data$.subscribe(c => console.log(c));

// With share() - 1 HTTP request shared
const shared$ = http.get('/api').pipe(share());
shared$.subscribe(a => console.log(a));
shared$.subscribe(b => console.log(b));
shared$.subscribe(c => console.log(c));

// shareReplay() - cache for late subscribers
const cached$ = http.get('/api').pipe(
  shareReplay({ bufferSize: 1, refCount: true })
);
```

**Multicasting Operators:**
- `share()` - Hot, multicast
- `shareReplay(n)` - Cache n values
- `publish()` + `refCount()` - Manual control

---

### 30. How do you handle error handling in RxJS streams?

```typescript
// catchError - handle and recover
data$.pipe(
  catchError(error => {
    console.error(error);
    return of(fallbackValue); // Return fallback
  })
);

// catchError - rethrow
data$.pipe(
  catchError(error => {
    this.notify.error(error.message);
    return throwError(() => error);
  })
);

// retry - automatic retry
data$.pipe(
  retry(3), // Retry 3 times
  catchError(err => of(null))
);

// retryWhen - conditional retry
data$.pipe(
  retryWhen(errors => errors.pipe(
    delay(1000),
    take(3)
  ))
);

// finalize - cleanup
data$.pipe(
  finalize(() => this.loading = false)
);
```

---

## 🧾 Forms (31-40)

### 31. Template-driven vs Reactive forms (deep comparison).

| Aspect | Template-driven | Reactive |
|--------|-----------------|----------|
| **Definition** | In template | In component class |
| **Data model** | Two-way binding | Immutable |
| **Validation** | Directives | Functions |
| **Testing** | Harder (needs DOM) | Easy (pure logic) |
| **Async validation** | Harder | Built-in |
| **Dynamic forms** | Difficult | Easy |
| **Use case** | Simple forms | Complex forms |

```typescript
// Template-driven
<form #form="ngForm" (ngSubmit)="onSubmit(form)">
  <input name="email" [(ngModel)]="email" required email>
</form>

// Reactive
this.form = this.fb.group({
  email: ['', [Validators.required, Validators.email]]
});

<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input formControlName="email">
</form>
```

---

### 32. How do Reactive Forms internally work?

```typescript
// FormControl - single input
const control = new FormControl('value');
control.value        // 'value'
control.valid        // true/false
control.errors       // { required: true }
control.valueChanges // Observable<any>

// FormGroup - group of controls
const group = new FormGroup({
  name: new FormControl(''),
  email: new FormControl('')
});

// FormArray - dynamic list
const array = new FormArray([
  new FormControl('item1'),
  new FormControl('item2')
]);
```

**Internal Structure:**
```
FormGroup
├── value: { name: '', email: '' }
├── valid: boolean
├── controls: { name: FormControl, email: FormControl }
├── valueChanges: Observable
└── statusChanges: Observable
```

---

### 33. What is FormArray and when do you use it?

**FormArray**: Dynamic list of form controls

```typescript
// Define form with FormArray
form = this.fb.group({
  todos: this.fb.array([])
});

get todos(): FormArray {
  return this.form.get('todos') as FormArray;
}

addTodo() {
  this.todos.push(this.fb.group({
    title: ['', Validators.required],
    completed: [false]
  }));
}

removeTodo(index: number) {
  this.todos.removeAt(index);
}
```

```html
<div formArrayName="todos">
  <div *ngFor="let todo of todos.controls; let i = index" [formGroupName]="i">
    <input formControlName="title">
    <button (click)="removeTodo(i)">Remove</button>
  </div>
</div>
<button (click)="addTodo()">Add Todo</button>
```

**Use Cases:**
- Dynamic form fields
- Repeatable form sections
- Shopping cart items
- Survey questions

---

### 34. How do you build dynamic forms?

```typescript
interface FormField {
  key: string;
  type: 'text' | 'select' | 'checkbox';
  label: string;
  validators?: ValidatorFn[];
  options?: { value: any; label: string }[];
}

// Build form from config
buildForm(fields: FormField[]): FormGroup {
  const group: { [key: string]: FormControl } = {};
  
  fields.forEach(field => {
    group[field.key] = new FormControl('', field.validators);
  });
  
  return new FormGroup(group);
}

// Template
<div *ngFor="let field of fields">
  <label>{{ field.label }}</label>
  
  <ng-container [ngSwitch]="field.type">
    <input *ngSwitchCase="'text'" [formControlName]="field.key">
    
    <select *ngSwitchCase="'select'" [formControlName]="field.key">
      <option *ngFor="let opt of field.options" [value]="opt.value">
        {{ opt.label }}
      </option>
    </select>
    
    <input *ngSwitchCase="'checkbox'" type="checkbox" [formControlName]="field.key">
  </ng-container>
</div>
```

---

### 35. How do you implement custom validators?

```typescript
// Sync Validator
export function noWhitespace(control: AbstractControl): ValidationErrors | null {
  if (control.value && control.value.trim() === '') {
    return { whitespace: true };
  }
  return null;
}

// Validator with parameter
export function minAge(age: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value && control.value < age) {
      return { minAge: { required: age, actual: control.value } };
    }
    return null;
  };
}

// Usage
form = this.fb.group({
  name: ['', [Validators.required, noWhitespace]],
  age: ['', [Validators.required, minAge(18)]]
});

// Template
<div *ngIf="form.get('age')?.errors?.['minAge']">
  Must be at least {{ form.get('age')?.errors?.['minAge'].required }} years old
</div>
```

---

### 36. How do you implement async validators?

```typescript
// Async Validator - check if email exists
@Injectable({ providedIn: 'root' })
export class EmailValidator {
  constructor(private http: HttpClient) {}
  
  checkEmail(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) return of(null);
      
      return this.http.get<boolean>(`/api/check-email/${control.value}`).pipe(
        map(exists => exists ? { emailTaken: true } : null),
        catchError(() => of(null))
      );
    };
  }
}

// Usage
form = this.fb.group({
  email: ['', 
    [Validators.required, Validators.email], // Sync
    [this.emailValidator.checkEmail()]        // Async
  ]
});

// Template - check pending state
<span *ngIf="form.get('email')?.pending">Checking...</span>
<span *ngIf="form.get('email')?.errors?.['emailTaken']">Email taken!</span>
```

---

### 37. How do you handle cross-field validation?

```typescript
// Cross-field validator
export function passwordMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirm = group.get('confirmPassword')?.value;
  
  if (password !== confirm) {
    return { passwordMismatch: true };
  }
  return null;
}

// Apply to FormGroup
form = this.fb.group({
  password: ['', [Validators.required, Validators.minLength(8)]],
  confirmPassword: ['', Validators.required]
}, {
  validators: [passwordMatch] // Group-level validator
});

// Template
<div *ngIf="form.errors?.['passwordMismatch']">
  Passwords do not match
</div>
```

---

### 38. How do you manage large complex forms?

**1. Split into sub-components:**
```typescript
// Parent
<form [formGroup]="form">
  <app-personal-info formGroupName="personal"></app-personal-info>
  <app-address-info formGroupName="address"></app-address-info>
  <app-payment-info formGroupName="payment"></app-payment-info>
</form>

// Child
@Component({
  selector: 'app-personal-info',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }]
})
```

**2. ControlValueAccessor for custom controls:**
```typescript
@Component({
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: CustomInputComponent,
    multi: true
  }]
})
export class CustomInputComponent implements ControlValueAccessor { }
```

**3. Form builders/services:**
```typescript
@Injectable()
export class UserFormService {
  createUserForm(): FormGroup { }
  patchUserData(form: FormGroup, data: User): void { }
}
```

---

### 39. How do you improve form performance?

```typescript
// 1. updateOn: 'blur' or 'submit'
form = this.fb.group({
  email: ['']
}, { updateOn: 'blur' }); // Validate on blur, not keypress

// 2. Debounce valueChanges
form.valueChanges.pipe(
  debounceTime(300)
).subscribe();

// 3. Use OnPush
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})

// 4. Lazy validation
form.get('email')?.statusChanges.pipe(
  filter(status => status !== 'PENDING')
);

// 5. Disable unnecessary CD
ngZone.runOutsideAngular(() => {
  // Heavy form operations
});
```

---

### 40. How do you reuse form logic?

**1. Form mixins/services:**
```typescript
@Injectable()
export class AddressFormService {
  createAddressGroup(): FormGroup {
    return new FormGroup({
      street: new FormControl('', Validators.required),
      city: new FormControl('', Validators.required),
      zipCode: new FormControl('', [Validators.required, Validators.pattern(/\d{5}/)])
    });
  }
}
```

**2. Shared validators:**
```typescript
// validators/index.ts
export * from './email.validator';
export * from './phone.validator';
export * from './address.validator';
```

**3. ControlValueAccessor components:**
```typescript
// Reusable address picker
<app-address-picker formControlName="shippingAddress"></app-address-picker>
<app-address-picker formControlName="billingAddress"></app-address-picker>
```

---

## 🔐 Authentication & Security (41-50)

### 41. How do you implement authentication in Angular?

**Flow:**
```
User Login → Backend validates → Returns JWT → Store token → 
Attach to requests → Route guards check token → Logout clears token
```

```typescript
// AuthService
@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'auth_token';
  
  login(credentials: Credentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(
      tap(response => {
        localStorage.setItem(this.tokenKey, response.accessToken);
      })
    );
  }
  
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }
  
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token && !this.isTokenExpired(token);
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}
```

---

### 42. JWT vs Session-based authentication.

| Aspect | JWT | Session |
|--------|-----|---------|
| **Storage** | Client (localStorage/cookie) | Server (memory/DB) |
| **Stateless** | Yes | No |
| **Scalability** | Better (no session sync) | Needs sticky sessions |
| **Revocation** | Harder | Easy (delete session) |
| **Size** | Larger | Session ID only |
| **XSS Risk** | Higher (if localStorage) | Lower |

```typescript
// JWT Structure
header.payload.signature

// Header: { "alg": "HS256", "typ": "JWT" }
// Payload: { "sub": "123", "name": "John", "exp": 1234567890 }
// Signature: HMACSHA256(header + payload, secret)

// Decode JWT (don't verify on client!)
function decodeJWT(token: string) {
  const payload = token.split('.')[1];
  return JSON.parse(atob(payload));
}
```

---

### 43. Where do you store tokens and why?

| Storage | XSS Risk | CSRF Risk | Recommendation |
|---------|----------|-----------|----------------|
| **localStorage** | High | None | Avoid for sensitive |
| **sessionStorage** | High | None | Better (clears on close) |
| **HttpOnly Cookie** | None | High | Best (with CSRF token) |
| **Memory** | Low | None | Most secure (lost on refresh) |

```typescript
// Best practice: HttpOnly cookie + CSRF token
// Backend sets:
// Set-Cookie: token=xxx; HttpOnly; Secure; SameSite=Strict

// For SPA with localStorage (if needed):
// 1. Use short expiry (15 min)
// 2. Implement refresh tokens (in HttpOnly cookie)
// 3. Clear on logout
// 4. Sanitize all user input

// Memory storage (most secure)
@Injectable({ providedIn: 'root' })
export class TokenService {
  private accessToken: string | null = null;
  
  setToken(token: string): void {
    this.accessToken = token;
  }
  
  getToken(): string | null {
    return this.accessToken;
  }
}
```

---

### 44. How do HTTP interceptors work internally?

**Interceptor Chain:**
```
Request → [Interceptor 1] → [Interceptor 2] → [HTTP] 
Response ← [Interceptor 2] ← [Interceptor 1] ← [HTTP]
```

```typescript
// Auth Interceptor
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Modify request
    const token = this.auth.getToken();
    const authReq = token ? req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    }) : req;
    
    // Handle response
    return next.handle(authReq).pipe(
      catchError(error => {
        if (error.status === 401) {
          this.auth.logout();
        }
        return throwError(() => error);
      })
    );
  }
}

// Register (order matters!)
providers: [
  { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
]
```

---

### 45. How do you handle token refresh?

```typescript
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshSubject = new BehaviorSubject<string | null>(null);
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(this.addToken(req)).pipe(
      catchError(error => {
        if (error.status === 401 && !req.url.includes('refresh')) {
          return this.handle401Error(req, next);
        }
        return throwError(() => error);
      })
    );
  }
  
  private handle401Error(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshSubject.next(null);
      
      return this.auth.refreshToken().pipe(
        switchMap(token => {
          this.isRefreshing = false;
          this.refreshSubject.next(token);
          return next.handle(this.addToken(req));
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.auth.logout();
          return throwError(() => err);
        })
      );
    }
    
    // Wait for refresh to complete
    return this.refreshSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(() => next.handle(this.addToken(req)))
    );
  }
}
```

---

### 46. What are route guards and types of guards?

| Guard | Interface | Purpose |
|-------|-----------|---------|
| **CanActivate** | `CanActivateFn` | Can access route? |
| **CanActivateChild** | `CanActivateChildFn` | Can access child routes? |
| **CanDeactivate** | `CanDeactivateFn` | Can leave route? |
| **CanMatch** | `CanMatchFn` | Can load module? (replaces CanLoad) |
| **Resolve** | `ResolveFn` | Pre-fetch data |

```typescript
// Functional guard (Angular 15+)
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};

// Usage
{
  path: 'admin',
  canActivate: [authGuard],
  loadChildren: () => import('./admin/admin.module')
}
```

---

### 47. How do you handle role-based access control?

```typescript
// Role guard
export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  const requiredRoles = route.data['roles'] as string[];
  const userRoles = auth.getUserRoles();
  
  const hasRole = requiredRoles.some(role => userRoles.includes(role));
  
  if (hasRole) return true;
  return router.createUrlTree(['/unauthorized']);
};

// Routes
{
  path: 'admin',
  canActivate: [authGuard, roleGuard],
  data: { roles: ['admin', 'superadmin'] }
}

// Directive for UI elements
@Directive({ selector: '[hasRole]' })
export class HasRoleDirective implements OnInit {
  @Input() hasRole!: string[];
  
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private auth: AuthService
  ) {}
  
  ngOnInit() {
    const hasRole = this.hasRole.some(r => 
      this.auth.getUserRoles().includes(r)
    );
    
    if (hasRole) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}

// Usage
<button *hasRole="['admin']">Delete User</button>
```

---

### 48. How do you protect Angular apps from XSS / CSRF?

**XSS Prevention (Built-in):**
```typescript
// Angular sanitizes by default
{{ userInput }}  // Auto-escaped

// Bypass (only if trusted!)
constructor(private sanitizer: DomSanitizer) {}
safeHtml = this.sanitizer.bypassSecurityTrustHtml(html);

// Never use innerHTML with user input
// Use textContent instead
```

**CSRF Prevention:**
```typescript
// 1. Use HttpOnly cookies for auth
// 2. Enable CSRF token from backend

// Angular's XSRF support
imports: [
  HttpClientModule,
  HttpClientXsrfModule.withOptions({
    cookieName: 'XSRF-TOKEN',
    headerName: 'X-XSRF-TOKEN'
  })
]
```

**Additional Security:**
```typescript
// Content Security Policy (CSP)
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'">

// Strict mode
"use strict";
```

---

### 49. How do you secure environment configurations?

```typescript
// 1. Never store secrets in environment.ts!
// environment.ts is bundled and visible

// 2. Use backend for secrets
// Frontend only stores public keys
export const environment = {
  production: true,
  apiUrl: '/api',  // Relative URL
  publicKey: 'pk_live_xxx'  // Only public keys
};

// 3. Runtime configuration
// Fetch config at startup
APP_INITIALIZER: {
  useFactory: (config: ConfigService) => () => config.load(),
  deps: [ConfigService],
  multi: true
}

// 4. Different builds per environment
ng build --configuration=production

// 5. Environment variables (build time)
// Replace during CI/CD pipeline
```

---

### 50. How do you handle logout across multiple tabs?

```typescript
// Method 1: BroadcastChannel API
@Injectable({ providedIn: 'root' })
export class AuthSyncService {
  private channel = new BroadcastChannel('auth');
  
  constructor(private auth: AuthService, private router: Router) {
    this.channel.onmessage = (event) => {
      if (event.data === 'logout') {
        this.auth.clearToken();
        this.router.navigate(['/login']);
      }
    };
  }
  
  broadcastLogout(): void {
    this.channel.postMessage('logout');
  }
}

// Method 2: Storage event listener
window.addEventListener('storage', (event) => {
  if (event.key === 'auth_token' && event.newValue === null) {
    // Token was removed in another tab
    this.router.navigate(['/login']);
  }
});

// Method 3: Service Worker
// Sync logout state via SW messaging
```

---

## 📚 Additional Resources

- [Angular Official Docs](https://angular.io/docs)
- [RxJS Official Docs](https://rxjs.dev/)
- [Angular University](https://angular-university.io/)
- [roadmap.sh/angular](https://roadmap.sh/angular)

---

[🧭 Navigate](../NAVIGATION.md) | [📊 Track Progress](../PROGRESS.md) | [🏠 Home](../README.md)
