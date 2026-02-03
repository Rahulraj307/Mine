# Angular - Topic Index

> Complete Angular guide from core concepts to advanced patterns

---

## Topics

| Topic | Description | Status |
|-------|-------------|--------|
| [Core Concepts](./core-concepts/) | Components, modules, data binding | ⬜ |
| [Architecture](./architecture/) | Project structure, best practices | ⬜ |
| [Change Detection](./change-detection/) | OnPush, zones, optimization | ⬜ |
| [RxJS](./rxjs/) | Observables, operators, patterns | ⬜ |
| [NgRx](./ngrx/) | State management | ⬜ |
| [Performance](./performance/) | Lazy loading, optimization | ⬜ |
| [Security](./security/) | XSS, CSRF, best practices | ⬜ |
| [Testing](./testing/) | Unit tests, E2E testing | ⬜ |

---

## Angular 17+ New Features

### Standalone Components
```typescript
@Component({
  selector: 'app-hello',
  standalone: true,
  imports: [CommonModule],
  template: `<h1>Hello {{ name }}</h1>`
})
export class HelloComponent {
  name = 'World';
}
```

### Signals
```typescript
import { signal, computed } from '@angular/core';

count = signal(0);
doubled = computed(() => this.count() * 2);

increment() {
  this.count.update(c => c + 1);
}
```

### New Control Flow
```html
@if (isLoggedIn) {
  <app-dashboard />
} @else {
  <app-login />
}

@for (item of items; track item.id) {
  <app-item [data]="item" />
}
```

---

## Quick Reference

### Component Lifecycle
1. `constructor` - DI only
2. `ngOnChanges` - Input changes
3. `ngOnInit` - Initialize data
4. `ngDoCheck` - Custom change detection
5. `ngAfterContentInit` - Content projected
6. `ngAfterContentChecked` - Content checked
7. `ngAfterViewInit` - View rendered
8. `ngAfterViewChecked` - View checked
9. `ngOnDestroy` - Cleanup

### Data Binding
```html
<!-- Interpolation -->
{{ value }}

<!-- Property binding -->
[property]="value"

<!-- Event binding -->
(event)="handler()"

<!-- Two-way binding -->
[(ngModel)]="value"
```

### Dependency Injection
```typescript
// Provided in root (singleton)
@Injectable({ providedIn: 'root' })
export class UserService {}

// Inject using inject()
userService = inject(UserService);
```

---

## Learning Path

1. ⬜ Components and templates
2. ⬜ Services and DI
3. ⬜ Routing and guards
4. ⬜ Forms (template & reactive)
5. ⬜ HTTP client
6. ⬜ RxJS operators
7. ⬜ Change detection
8. ⬜ State management

---

## Related Resources

- [TaskMaster Pro Project](../08_Projects/mean-taskmaster-pro/) - Full MEAN app
- [Interview Q&A](../12_Interview_QnA/Angular_Master_QnA.md)
- [RxJS Q&A](../12_Interview_QnA/RxJS_Master_QnA.md)

---

[🧭 Navigate](../NAVIGATION.md) | [📊 Track Progress](../PROGRESS.md)
