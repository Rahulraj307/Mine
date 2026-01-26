# Angular Performance (OnPush, Lazy Loading, @defer, Budgets)

> **Goal**: Build performant Angular applications that load fast and stay responsive.

---

## 1️⃣ Change Detection Strategy: OnPush

Angular's default change detection runs on **every** async event (click, timer, HTTP response) and checks **all** components. This is wasteful.

**`OnPush` Strategy:**
The component only re-renders when:
1.  An `@Input()` reference changes (not mutation!).
2.  An event originates from the component itself.
3.  An `Observable` bound via the `async` pipe emits.
4.  `ChangeDetectorRef.markForCheck()` is called manually.

```typescript
@Component({
  selector: 'app-user-card',
  changeDetection: ChangeDetectionStrategy.OnPush, // <-- Enable
  template: `...`
})
export class UserCardComponent {
  @Input() user!: User;
}
```

> [!WARNING]
> With `OnPush`, mutating an object will NOT trigger a re-render. You must pass a **new object reference**.

---

## 2️⃣ Lazy Loading Routes

Don't load the entire app upfront. Load feature modules only when the user navigates to them.

**Modern (Standalone):**
```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  }
];
```

---

## 3️⃣ `@defer` Blocks (Angular 17+)

Lazy load parts of your template, not just routes.

**Use Cases:** Heavy charts, maps, rich text editors.

```html
@defer (on viewport) {
  <app-heavy-chart [data]="chartData" />
} @placeholder {
  <div class="skeleton-loader"></div>
} @loading (minimum 200ms) {
  <app-spinner />
} @error {
  <p>Failed to load chart.</p>
}
```

**Triggers:**
*   `on viewport`: When element scrolls into view.
*   `on idle`: When browser is idle.
*   `on interaction`: On hover or focus.
*   `when condition`: When a boolean expression is true.

---

## 4️⃣ Bundle Budgets

Define size limits in `angular.json`. The build will **fail** if exceeded.

```json
// angular.json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "500kb",
    "maximumError": "1mb"
  },
  {
    "type": "anyComponentStyle",
    "maximumWarning": "2kb",
    "maximumError": "4kb"
  }
]
```

---

## 5️⃣ Image Optimization (`NgOptimizedImage`)

Use Angular's built-in directive for automatic lazy loading and size enforcement.

```html
<img ngSrc="hero.jpg" width="800" height="600" priority />
```

**Benefits:**
*   Enforces `width`/`height` to prevent layout shifts.
*   Auto-generates `srcset` for responsive images.
*   Lazy loads images by default.

---

## 6️⃣ TrackBy for `*ngFor` / `@for`

Prevents re-rendering the entire list when one item changes.

```html
<!-- Old *ngFor -->
<li *ngFor="let user of users; trackBy: trackByUserId">{{ user.name }}</li>

<!-- New @for -->
@for (user of users; track user.id) {
  <li>{{ user.name }}</li>
}
```
```typescript
trackByUserId(index: number, user: User): number {
  return user.id;
}
```

---

## 7️⃣ Quick Checklist

- [ ] Use `OnPush` on all presentational (dumb) components.
- [ ] Lazy load all feature routes.
- [ ] Use `@defer` for heavy, below-the-fold widgets.
- [ ] Set bundle budgets.
- [ ] Use `trackBy` / `track` for all lists.
- [ ] Use `NgOptimizedImage` for images.
