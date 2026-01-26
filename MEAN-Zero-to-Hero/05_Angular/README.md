# 05 Angular: The Enterprise Framework

> **Goal**: Master Architecture, Dependency Injection, RxJS, and Performance Optimization.

---

## 1️⃣ Concept Explanation

### What is Angular?
A cohesive, opinionated **platform** for building mobile and desktop web applications. Unlike React (a library), Angular provides everything out of the box (Router, HTTP, Forms, Testing).

### Key Architecture
1.  **Modules (NgModule)**: Containers for a block of code (Legacy but important).
2.  **Standalone Components**: The modern way (Angular 14+), removing the need for NgModules.
3.  **Components**: The fundamental building blocks of UI + Logic.
4.  **Services**: Reusable logic not bound to a view (Data fetching, State).
5.  **Directives**: Attaching behavior to elements (`*ngIf`, `*ngFor`).

---

## 2️⃣ Code Examples

### ❌ Bad Example (Component doing everything)
```typescript
@Component({...})
export class UserComponent {
  users: any[];
  
  constructor(private http: HttpClient) {
    // Bad: API call in logic, no validation, direct subscribe
    this.http.get('api/users').subscribe(data => this.users = data);
  }
}
```

### ✅ Good Example (Separation of Concerns)
```typescript
// user.service.ts
@Injectable({ providedIn: 'root' })
export class UserService {
  // $ suffix indicates Observable stream
  getUsers$(): Observable<User[]> {
    return this.http.get<User[]>('api/users').pipe(shareReplay(1));
  }
}

// user.component.ts
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush, // Performance
  template: `
    <div *ngFor="let user of users$ | async"> <!-- Async Pipe handles subscription -->
      {{ user.name }}
    </div>
  `
})
export class UserComponent {
  users$ = this.userService.getUsers$();
  constructor(private userService: UserService) {}
}
```

---

## 3️⃣ Internal Working: Change Detection

Angular synchronizes the View with the Model.
1.  **Zone.js**: Patches async APIs (`setTimeout`, `click`, `XHR`).
2.  **Trigger**: When async event occurs, Zone tells Angular "Something changed".
3.  **Tick**: Angular traverses the component tree from Top to Bottom checking for changes.
4.  **Default Strategy**: Checks EVERYTHING. (Slow).
5.  **OnPush Strategy**: Checks ONLY if Input references change or Async Pipe emits. (Fast).

---

## 4️⃣ Common Mistakes

### 🚨 Beginner Mistakes
- **Nested Subscriptions**: `sub.subscribe(a => sub2.subscribe(b => ...))` (Use `switchMap`).
- **Memory Leaks**: Subscribing but never Unsubscribing (Use `async` pipe or `takeUntil`).
- **ExpressionChangedAfterItHasBeenCheckedError**: Modifying data *after* Angular checked it.

### ⚠️ Production Mistakes
- **Large Bundles**: Not using Lazy Loading boundaries.
- **Heavy computations in Templates**: `{{ calculateTotal() }}` re-runs on EVERY change detection cycle. (Use Pipes or Signals).

---

## 5️⃣ Optimization & Best Practices

### Performance
- **OnPush Always**: Default for all new components.
- **TrackBy**: Use `trackBy` function in `*ngFor` to prevent DOM re-creation.
- **Lazy Loading**: `loadComponent: () => import(...)`.

### Architecture
- **Features Folder**: Group by Domain (`features/auth`, `features/dashboard`).
- **Core Folder**: Singleton services, interceptors (`core/services`).
- **Shared Folder**: Reusable UI components, pipes (`shared/ui`).

---

## 6️⃣ Interview QnA

### Beginner
**Q: Component vs Directive?**
A: A Component is a Directive *with a template*.

**Q: Lifecycle Hooks order?**
A: `OnChanges` -> `OnInit` -> `DoCheck` -> `AfterContentInit` -> `AfterContentChecked` -> `AfterViewInit` -> `AfterViewChecked` -> `OnDestroy`.

### Intermediate
**Q: Explain Hierarchical Dependency Injection.**
A: Services provided in a parent component are visible to children. If a child provides the same service, it creates a *new instance* for its subtree (Shadowing).

**Q: Subject vs BehaviorSubject?**
A: `Subject` has no initial value. Subscribers only get *new* values. `BehaviorSubject` has an initial value. New subscribers get the *latest* value immediately.

---

## 7️⃣ Web References

- [Angular Official Docs](https://angular.io/)
- [Angular University (Deep Dives)](https://blog.angular-university.io/)
- [RxJS Marbles](https://rxmarbles.com/)
