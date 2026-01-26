# Enterprise Angular Architecture

> **Goal**: Scalable Folder Structures, Smart vs Dumb Components, and DI Patterns.

---

## 1️⃣ Concept Explanation

### LIFT Principle
- **L**ocating code is easy.
- **I**dentify code at a glance.
- **F**lat structure as long as possible.
- **T**ry to stay DRY (Don't Repeat Yourself).

### Smart vs Dumb Components
- **Smart (Container)**: Talks to Services/Store. Passes data down. Handles events.
- **Dumb (Presentational)**: `Inputs()` for data, `Outputs()` for events. No logic. Reusable.

---

## 2️⃣ Code Examples

### Recommended Folder Structure
```
src/
  app/
    core/             # Singleton Services, Interceptors, Guards
    shared/           # UI Components, Pipes, Directives (Reuse)
    features/         # Domain Logic
      dashboard/
        components/
        pages/
        dashboard.routes.ts
      auth/
```

### Hierarchical Injection
```typescript
@Component({
  selector: 'app-editor',
  providers: [EditorService] // New instance for this component and children
})
export class EditorComponent {}
```

---

## 3️⃣ Internal Working: Dependency Resolution

When you ask for a Service:
1.  Angular checks `ElementInjector` (Providers on Component).
2.  Walks up the DOM tree to Parent Component Injectors.
3.  Checks `ModuleInjector` (Providers in NgModules or Root).
4.  If not found -> Error `No provider for X`.

---

## 4️⃣ Common Mistakes

### 🚨 Beginner Mistakes
- **Everything in Root**: Providing every service in `root` even if only used in one place.
- **Circular Dependencies**: Service A needs B, B needs A. (Fix: Use `Injector` or restructure).

### ⚠️ Production Mistakes
- **Deep Imports**: `import { X } from '../../../../core/services'`. Use TypeSript Path Aliases (`@core/services`).
- **God Components**: A single component with 2000 lines of code. Split it up!

---

## 5️⃣ Optimization & Best Practices

### Barrels (index.ts)
Use `index.ts` to export public API of a folder.
```typescript
// shared/index.ts
export * from './button.component';
export * from './date.pipe';
```

### Nx Monorepo
For enterprise, consider **Nx**. It allows multiple apps and libraries in one repo, with shared caching and dependency graph analysis.

---

## 6️⃣ Interview QnA

### Beginner
**Q: What is `providedIn: 'root'`?**
A: It creates a singleton service available throughout the app. It also enables Tree Shaking (if unused, it's removed).

### Intermediate
**Q: How do you restrict a service to a specific module?**
A: Provide it in the `providers` array of a `LazyLoadedModule` or a `Component`.

### Scenario-Based
**Q: You have a Widget that needs a fresh configuration every time it's used. How do you design the Service?**
A: Do NOT provide it in Root. Provide it in the WidgetComponent's `providers` array. Each Widget gets its own Service instance.

---

## 7️⃣ Web References

- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Nx.dev](https://nx.dev/)
