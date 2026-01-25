# Dependency Injection in Angular

## 📚 Table of Contents
- [Beginner: What is Dependency Injection?](#beginner-what-is-dependency-injection)
- [Intermediate: Angular's DI System](#intermediate-angulars-di-system)
- [Advanced: Provider Types & Injector Hierarchy](#advanced-provider-types--injector-hierarchy)

---

## Beginner: What is Dependency Injection?

### The Problem Without DI

```typescript
// ❌ Tight coupling: Class creates its own dependencies
class UserComponent {
  private userService: UserService;
  private logger: Logger;
  
  constructor() {
    this.userService = new UserService();  // What if UserService changes?
    this.logger = new Logger();            // Can't swap for testing
  }
}

// Problems:
// 1. Can't test without real UserService
// 2. Can't use different logger in production vs development
// 3. Every component creates new instances
```

### The Solution: DI

```typescript
// ✅ Loose coupling: Dependencies are provided from outside
class UserComponent {
  constructor(
    private userService: UserService,  // Someone else provides these
    private logger: Logger
  ) {}
}

// Benefits:
// 1. Easy testing (inject mock services)
// 2. Configurable (swap implementations)
// 3. Shared instances (singleton services)
```

### DI in Angular

```typescript
// 1. Define a service
@Injectable()
export class UserService {
  getUsers() {
    return ['Alice', 'Bob'];
  }
}

// 2. Register it (providedIn: 'root' = singleton)
@Injectable({ providedIn: 'root' })
export class UserService { ... }

// 3. Inject it
@Component({ ... })
export class UserListComponent {
  constructor(private userService: UserService) {}
}
```

---

## Intermediate: Angular's DI System

### How Angular Finds Dependencies

```
1. Component requests UserService
           ↓
2. Angular looks at component's injector
           ↓
3. Not found? → Look at parent injector
           ↓
4. Not found? → Keep going up...
           ↓
5. Found in root? → Return instance
           ↓
6. Not found anywhere? → ERROR!
```

### Provider Registration Methods

```typescript
// Method 1: providedIn (Preferred for tree-shaking)
@Injectable({ providedIn: 'root' })
export class GlobalService { }

// Method 2: In NgModule
@NgModule({
  providers: [ModuleService]
})
export class FeatureModule { }

// Method 3: In Component (new instance per component)
@Component({
  providers: [LocalService]
})
export class MyComponent { }
```

### Singleton vs Multi-Instance

```typescript
// SINGLETON (providedIn: 'root')
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Same instance used everywhere
}

// MULTI-INSTANCE (component provider)
@Component({
  selector: 'app-counter',
  providers: [CounterService]  // Each counter gets own instance
})
export class CounterComponent { }
```

### The @Inject Decorator

```typescript
// For non-class tokens
import { Inject, InjectionToken } from '@angular/core';

export const API_URL = new InjectionToken<string>('api.url');

@NgModule({
  providers: [
    { provide: API_URL, useValue: 'https://api.example.com' }
  ]
})
export class AppModule { }

@Component({ ... })
export class ApiComponent {
  constructor(@Inject(API_URL) private apiUrl: string) { }
}
```

---

## Advanced: Provider Types & Injector Hierarchy

### Provider Types

```typescript
// 1. useClass: Provide a class
{ provide: Logger, useClass: BetterLogger }

// 2. useValue: Provide a static value
{ provide: API_URL, useValue: 'https://api.example.com' }

// 3. useFactory: Provide using factory function
{
  provide: UserService,
  useFactory: (http: HttpClient, config: Config) => {
    return config.mock 
      ? new MockUserService() 
      : new RealUserService(http);
  },
  deps: [HttpClient, Config]
}

// 4. useExisting: Alias to another provider
{ provide: OldLogger, useExisting: NewLogger }
```

### Injector Hierarchy

```
┌──────────────────────────────────────────┐
│           Platform Injector              │ ← Angular framework services
└─────────────────┬────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│            Root Injector                 │ ← providedIn: 'root'
│     (NgModule providers, root services)  │
└─────────────────┬────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│          Module Injector                 │ ← Lazy-loaded module providers
└─────────────────┬────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│       Element Injector (Component)       │ ← Component providers
│    ┌────────────────────────────────┐    │
│    │    Child Component Injector    │    │
│    └────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

### Resolution Modifiers

```typescript
// @Optional: Don't throw if not found
constructor(@Optional() private logger?: Logger) { }

// @Self: Only look in current injector
constructor(@Self() private localService: LocalService) { }

// @SkipSelf: Skip current injector, start from parent
constructor(@SkipSelf() private parentService: ParentService) { }

// @Host: Stop at host component injector
constructor(@Host() private service: SomeService) { }
```

### Lazy Loaded Modules & DI

```typescript
// Services in lazy-loaded modules have their OWN injector

// AppModule
@Injectable({ providedIn: 'root' })
export class GlobalService { }  // Singleton across entire app

// LazyModule
@NgModule({
  providers: [LazyService]  // Only available in this module
})
export class LazyModule { }
```

**Warning**: If a lazy module provides a service also in root, they become TWO different instances!

### Multi Providers

```typescript
// Collect multiple values for one token
const HTTP_INTERCEPTORS = new InjectionToken<HttpInterceptor[]>('interceptors');

@NgModule({
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ]
})
export class AppModule { }

// Injectable gets array:
constructor(@Inject(HTTP_INTERCEPTORS) private interceptors: HttpInterceptor[]) {
  // interceptors = [AuthInterceptor, LoggingInterceptor, ErrorInterceptor]
}
```

### Tree-Shakable Providers

```typescript
// ❌ Old way: Module providers (not tree-shakable)
@NgModule({
  providers: [UserService]  // Always bundled, even if unused
})

// ✅ New way: providedIn (tree-shakable)
@Injectable({ providedIn: 'root' })
export class UserService { }  // Only bundled if actually used
```

---

## 🎯 Interview Questions

### Fresher Level
1. What is dependency injection in Angular?
2. How do you create and inject a service?
3. What does `providedIn: 'root'` mean?

### Mid Level
1. Explain the difference between singleton and non-singleton services.
2. What are the different provider types (useClass, useValue, etc.)?
3. How does lazy loading affect service instances?

### Senior Level
1. Explain the injector hierarchy in Angular.
2. When would you use `@Self()`, `@SkipSelf()`, and `@Host()`?
3. How do you make providers tree-shakable?

---

## 🧪 Interview Problem

**What happens here?**

```typescript
@Injectable({ providedIn: 'root' })
export class CounterService {
  count = 0;
  increment() { this.count++; }
}

@Component({
  selector: 'app-counter',
  providers: [CounterService],
  template: `<button (click)="add()">{{ counter.count }}</button>`
})
export class CounterComponent {
  constructor(public counter: CounterService) {}
  add() { this.counter.increment(); }
}

// Two <app-counter> components on the same page.
// User clicks each button once. What are the counts?
```

<details>
<summary>Answer</summary>

**Each counter shows 1.**

Why? The `CounterService` is provided at the component level (`providers: [CounterService]`), so each `CounterComponent` gets its own instance.

If `CounterService` only had `providedIn: 'root'` (no component provider), both counters would share the same count (showing 2).

</details>

---

**Next**: [Change Detection](../04_change-detection/)
