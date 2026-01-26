# 📘 MASTER INTERVIEW Q&A: Angular (v12 / v14 → v21)
> **Section 4: Angular (The Enterprise Standard)**
> Architecture • Migration • Performance • Real-World Story

---

## 🟢 Part 1: Angular Core (Foundation)

### 1️⃣ What is Angular? Why choose it over React?
**Answer:**
Angular is a **TypeScript-based**, **opinionated**, **component-based** framework for building scalable web applications.
*   **Batteries Included:** Routing, Forms, HTTP, and Testing are built-in (verified to work together).
*   **Opinionated:** Enforces a specific structure (MVVM/MVC), making it better for large teams to maintain consistency.
*   **Dependency Injection:** deeply integrated, unlike React where you need external context/providers manually often.

### 2️⃣ Component Lifecycle (The "Must Know")
**Answer:**
1.  **`constructor()`**: Class initialization. Dependency Injection happens here. **NO logic here.**
2.  **`ngOnChanges()`**: Runs when an `@Input()` value changes.
3.  **`ngOnInit()`**: Component is ready. **API calls go here.**
4.  **`ngAfterViewInit()`**: View (HTML) is fully rendered. DOM manipulation safe here.
5.  **`ngOnDestroy()`**: Component is removed. **Cleanup (unsubscribe observables)** happens here.

### 3️⃣ Directives: Structural vs Attribute
**Answer:**
*   **Structural (`*`)**: Changes the DOM layout (Adds/Removes elements).
    *   `*ngIf`, `*ngFor` (Old) / `@if`, `@for` (New).
*   **Attribute (`[]`)**: Changes the appearance or behavior of an element.
    *   `[ngClass]`, `[ngStyle]`, `[disabled]`.

---

## 🟡 Part 2: The Evolution (Legacy vs Modern)

### 4️⃣ Standalone Components (v15+) vs NgModules (Old)
**Answer:**
*   **Legacy (NgModule)**: You declare a component in a `Module`, imports go in the `Module`. It adds boilerplate and makes lazy loading complex.
*   **Modern (Standalone)**: The component manages its own dependencies.
    *   **Reason:** Faster build, better Tree-Shaking, easier learning curve.
```typescript
@Component({
  standalone: true, // ✅ The Flag
  imports: [CommonModule, MatButtonModule],
  template: `...`
})
export class UserComponent {}
```

### 5️⃣ Signals (v16+) vs RxJS (The Hot Topic 🔥)
**Answer:**
*   **RxJS**: Asynchronous streams. Great for **Events** (HTTP, Clicks, Websockets).
*   **Signals**: Synchronous reactive state. Great for **local UI state**.
*   **Key Difference:** Signals have no "Subscription" management. They auto-update the DOM extremely efficiently (fine-grained reactivity).
```typescript
// Signal
count = signal(0);
double = computed(() => this.count() * 2);

update() {
  this.count.update(v => v + 1);
}
```

### 6️⃣ Control Flow Syntax (v17+)
**Answer:**
Replaced `*ngIf` and `*ngFor` with built-in block syntax.
*   **Performance:** Up to 30% faster reconciliation.
*   **Syntax:** content-projection friendly.
```html
<!-- Old -->
<div *ngIf="loggedIn; else guest">Hello</div>

<!-- New -->
@if (loggedIn) {
  <div>Hello</div>
} @else {
  <guest-component />
}
```

### 7️⃣ Zoneless Angular (v18+)
**Answer:**
Traditionally, **Zone.js** monkey-patched browser APIs (click, setTimeout) to trigger Change Detection. This had performance overhead.
**Zoneless:** Angular detects changes via **Signals** or explicit `markForCheck`.
*   **Result:** Faster initial load, less memory usage.

---

## 🔵 Part 3: Architecture & Migration (Senior Level)

### 8️⃣ Migration Strategy (v14 to v18+)
**Answer:**
**"We don't rewrite. We evolve."**
1.  **Update CLI**: `ng update @angular/core @angular/cli`.
2.  **Standalone Migration**: Run the schematic to convert components to `standalone: true`. Remove `.module.ts` files.
3.  **Typed Forms**: Migrate `FormGroup` to stricter types (v14 feature).
4.  **Control Flow**: Run `ng g @angular/core:control-flow`.
5.  **Signals**: Gradually replace simple `BehaviorSubject`s in services with `signal()`.

### 9️⃣ Performance Optimization Checklist
**Answer:**
1.  **OnPush Strategy**: `changeDetection: ChangeDetectionStrategy.OnPush`. Only updates if inputs reference changes.
2.  **Lazy Loading**: Split routes using `loadComponent`.
3.  **@defer**: Lazy load heavy components (like Charts/Maps) inside the template.
    ```html
    @defer (on viewport) {
      <heavy-chart />
    } @placeholder {
      <spinner />
    }
    ```
4.  **Image Opt**: Use `NgOptimizedImage` (`ngSrc`) to enforce width/height and lazy loading.

### 🔟 Smart vs Dumb Components Pattern
**Answer:**
*   **Smart (Container)**: Talks to Services, manages State, handles Logic. Passes data down.
*   **Dumb (Presentational)**: Recieves data via `@Input()`, emits events via `@Output()`. Pure UI.
*   **Benefit:** Reusability and easier testing.

---

## 🔴 Part 4: Behavioral & Real-World Story 📖

### 1️⃣1️⃣ "Tell me about a challenging project / massive refactor?" (The STAR Story)
**Situation:**
"We had a legacy Angular 11 Monolith used by 50,000 users. It had a massive `SharedModule` (3MB bundle), standard Change Detection causing UI lag, and build times were 15 minutes."

**Task:**
"My goal was to upgrade to Angular 17, reduce bundle size by 40%, and improve Core Web Vitals (LCP) under 2.5s."

**Action:**
1.  **Decoupling:** Broken down the `SharedModule` using **Standalone Components** (SCAM pattern first, then full Standalone).
2.  **Performance:** Switched all data-tables to `OnPush` change detection to stop unnecessary rerenders.
3.  **Modernization:** Implemented `@defer` for the heavy Dashboard widgets. They now load only when the user scrolls them into view.
4.  **State:** Replaced a complex `NgRx` store for a simple Filter feature with **Signals**, reducing boilerplate code by 60%.

**Result:**
*   Build time dropped to 4 minutes (via ESBuild).
*   Initial Bundle size dropped 45%.
*   User complaints about "laggy forms" disappeared due to OnPush + Signals.

### 1️⃣2️⃣ How do you handle State Management?
**Answer:**
"It depends on scope."
1.  **Local Component State:** Use **Signals** or simple variables.
2.  **Feature State (Parent-Child):** Input/Output or a lightweight Service with Signals.
3.  **Global App State (Auth, User Profile, Config):** Singleton Service with `Signals` or `RxJS BehaviorSubject`.
4.  **Complex Enterprise State:** **NgRx** (Redux pattern) or **NgRx SignalStore**. Only when we need time-travel, undo/redo, or complex effect chains.

### 1️⃣3️⃣ CI/CD & Deployment Flow
**Answer:**
1.  **Lint & Test:** GitHub Actions runs `ng lint` and `ng test --browsers=ChromeHeadless`.
2.  **Build:** `ng build --configuration=production` (AOT compilation, Minification).
3.  **Artifact:** Generates `dist/` folder.
4.  **Deploy:**
    *   **AWS S3 + CloudFront:** Upload `dist` files. CloudFront serves them globally.
    *   **SPA Handling:** Configure CloudFront Error Pages (404) to redirect to `index.html` so Angular Routing works on refresh.

### 1️⃣4️⃣ HTTP Interceptors - Use Cases?
**Answer:**
We don't copy-paste headers in every API call. We use Interceptors (Functional Interceptors in v18+).
1.  **AuthInterceptor**: Appends `Authorization: Bearer xyz`.
2.  **ErrorInterceptor**: Catches `401 Unauthorized` → Redirects to Login. Catches `500` → Shows Toastr notification.
3.  **LoadingInterceptor**: Shows a global spinner when a request starts, hides when it ends.

### 1️⃣5️⃣ Functional Interceptors (v18+ Code)
**Answer:**
```typescript
// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const clonedReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(clonedReq);
  }
  return next(req);
};

// app.config.ts (Registering)
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';

export const appConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

### 1️⃣6️⃣ Functional Guards (v18+ Code)
**Answer:**
```typescript
// auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

// app.routes.ts (Registering)
export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }
];
```

---


## 🔥 Part 5: Rapid Fire (Senior Check)

*   **Diff between `ng-content` and `@Input`?**
    *   `@Input` passes **Data**. `ng-content` passes **HTML/UI** (Content Projection).
*   **What is a Pipe?**
    *   Transforms data in template (`{{ date | date:'short' }}`). Pure pipes are memoized (fast).
*   **`mergeMap` vs `switchMap`?**
    *   `switchMap`: Cancels previous request (Search Typeahead). `mergeMap`: Runs all parallel (Uploads).
*   **JIT vs AOT?**
    *   **AOT (Ahead-of-Time)**: Compiles during build (Production).
    *   **JIT (Just-in-Time)**: Compiles in browser (Old Dev mode).
