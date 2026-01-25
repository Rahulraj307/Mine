# Change Detection in Angular

## 📚 Table of Contents
- [Beginner: What is Change Detection?](#beginner-what-is-change-detection)
- [Intermediate: Zone.js & How It Works](#intermediate-zonejs--how-it-works)
- [Advanced: OnPush Strategy & Optimization](#advanced-onpush-strategy--optimization)

---

## Beginner: What is Change Detection?

### The Problem

```typescript
@Component({
  template: `<h1>{{ title }}</h1>`
})
export class AppComponent {
  title = 'Hello';
  
  changeTitle() {
    this.title = 'World';  // How does Angular know to update the view?
  }
}
```

### The Answer: Change Detection

Angular periodically checks if component data has changed, then updates the DOM.

```
1. Something happens (click, HTTP response, timer)
           ↓
2. Angular runs change detection
           ↓
3. Compares current values with previous values
           ↓
4. Updates DOM where values changed
```

### The Component Tree

```
          AppComponent
         /            \
   HeaderComponent    MainComponent
                     /            \
              SidebarComponent   ContentComponent
```

**Default behavior**: When change detection runs, it checks EVERY component in the tree.

---

## Intermediate: Zone.js & How It Works

### What is Zone.js?

Zone.js is a library that patches all async APIs to notify Angular when async operations complete.

```javascript
// Zone.js patches:
setTimeout     → Notifies Angular after callback
fetch/XMLHttpRequest → Notifies Angular after response
addEventListener → Notifies Angular after event
Promise.then   → Notifies Angular after resolution
```

### How the Cycle Works

```
1. User clicks button
         ↓
2. Event listener triggered (Zone.js saw this)
         ↓
3. Your handler runs: this.data = newValue
         ↓
4. Zone.js notifies Angular: "async task finished"
         ↓
5. Angular runs change detection from root
         ↓
6. DOM updated
```

### Zone.js in Action

```typescript
@Component({
  template: `
    <p>{{ value }}</p>
    <button (click)="update()">Update</button>
  `
})
export class DemoComponent {
  value = 'Initial';
  
  update() {
    // All these trigger change detection automatically:
    
    this.value = 'Sync change';  // ✓
    
    setTimeout(() => {
      this.value = 'Timeout';    // ✓ Zone.js patched
    }, 1000);
    
    fetch('/api').then(() => {
      this.value = 'API done';   // ✓ Zone.js patched
    });
  }
}
```

### Change Detection Cycle

```typescript
// Angular's simplified change detection pseudocode
function detectChanges(component) {
  // 1. Update input bindings
  for (child of component.children) {
    child.inputs = getNewInputs();
  }
  
  // 2. Check component's template bindings
  for (binding of component.bindings) {
    const newValue = evaluate(binding.expression);
    if (newValue !== binding.previousValue) {
      updateDOM(binding.element, newValue);
      binding.previousValue = newValue;
    }
  }
  
  // 3. Recurse to children
  for (child of component.children) {
    detectChanges(child);
  }
}
```

---

## Advanced: OnPush Strategy & Optimization

### Default vs OnPush

```typescript
// DEFAULT: Check this component whenever ANY change detection runs
@Component({
  changeDetection: ChangeDetectionStrategy.Default
})

// ONPUSH: Only check when inputs change or explicitly requested
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### When OnPush Runs Change Detection

1. **Input reference changes** (not mutation)
2. **Event from component or child** (click, etc.)
3. **Async pipe** emits new value
4. **Manual trigger** (markForCheck, detectChanges)

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>{{ user.name }}</p>
    <button (click)="changeName()">Change</button>
  `
})
export class UserComponent {
  @Input() user!: User;
  
  changeName() {
    // ❌ This WON'T update the view!
    this.user.name = 'New Name';  // Same object reference
    
    // ✅ This WILL update the view
    this.user = { ...this.user, name: 'New Name' };
  }
}
```

### The Rules of OnPush

```typescript
// ❌ Mutation doesn't work with OnPush
this.items.push(newItem);  // Same array reference

// ✅ New reference works
this.items = [...this.items, newItem];

// ❌ Observables without async pipe
this.data$.subscribe(data => this.data = data);  // Won't update

// ✅ Async pipe handles everything
{{ data$ | async }}
```

### Manual Triggering

```typescript
import { ChangeDetectorRef } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyComponent {
  constructor(private cdr: ChangeDetectorRef) {}
  
  // Method 1: Mark component and ancestors for check
  updateFromExternal(data: Data) {
    this.data = data;
    this.cdr.markForCheck();  // "Check me next cycle"
  }
  
  // Method 2: Run change detection immediately (just this subtree)
  forceUpdate() {
    this.data = fetchDataSync();
    this.cdr.detectChanges();  // "Check me NOW"
  }
  
  // Method 3: Detach from change detection entirely
  ngOnInit() {
    this.cdr.detach();  // No automatic checks
  }
  
  // Then manually:
  someMethod() {
    this.cdr.reattach();
    this.cdr.detectChanges();
    this.cdr.detach();
  }
}
```

### Performance Visualization

```
Default Strategy (100 components)
─────────────────────────────────
Every click → Check 100 components
Every HTTP  → Check 100 components
Every timer → Check 100 components

OnPush Strategy (100 components, properly implemented)
──────────────────────────────────────────────────────
Button click in comp 47 → Check 47 and its children only
HTTP in comp 23         → Check 23 and its children only
Timer in comp 1         → Check 1 and its children only
```

### Zone-less Angular

```typescript
// For ultimate performance: disable Zone.js entirely
// main.ts
platformBrowserDynamic()
  .bootstrapModule(AppModule, { ngZone: 'noop' })
  
// Then manually trigger all change detection:
@Component({ ... })
export class AppComponent {
  constructor(private cdr: ChangeDetectorRef) {}
  
  onClick() {
    // Must manually call after every change
    this.cdr.detectChanges();
  }
}
```

### Common Mistakes

```typescript
// ❌ MISTAKE 1: Using OnPush but mutating objects
@Input() items: Item[];
addItem(item: Item) {
  this.items.push(item);  // View won't update!
}

// ❌ MISTAKE 2: Heavy computation in templates
{{ calculateExpensiveValue() }}  // Called on every CD cycle!

// ✅ FIX: Use pure pipes or memoization
{{ expensiveValue$ | async }}

// ❌ MISTAKE 3: Change detection in ngOnInit with OnPush
ngOnInit() {
  this.loadData();  // Async data won't trigger CD
}

// ✅ FIX: Use async pipe
data$ = this.service.loadData();
// Template: {{ data$ | async }}
```

---

## 🎯 Interview Questions

### Fresher Level
1. What is change detection in Angular?
2. When does Angular check for changes?
3. What is Zone.js?

### Mid Level
1. What is OnPush change detection strategy?
2. When does OnPush actually check for changes?
3. What's the difference between `markForCheck` and `detectChanges`?

### Senior Level
1. How would you optimize a slow Angular application using change detection?
2. Explain the change detection cycle in detail.
3. When would you consider running Angular without Zone.js?

---

## 🧪 Interview Problem

**This component has a performance issue. Can you find and fix it?**

```typescript
@Component({
  template: `
    <div *ngFor="let item of items">
      {{ formatItem(item) }}
    </div>
    <button (click)="toggle()">Toggle</button>
  `
})
export class ListComponent {
  items = [/* 1000 items */];
  isVisible = true;
  
  toggle() {
    this.isVisible = !this.isVisible;
  }
  
  formatItem(item: Item): string {
    return /* expensive computation */;
  }
}
```

<details>
<summary>Answer</summary>

**Problem**: `formatItem()` is called for ALL 1000 items on EVERY change detection cycle (including clicking toggle which doesn't affect the items!).

**Fixes**:

1. **Use pure pipe**:
```typescript
@Pipe({ name: 'format', pure: true })
export class FormatPipe implements PipeTransform {
  transform(item: Item): string { /* ... */ }
}
// Template: {{ item | format }}
```

2. **Use OnPush + pre-compute**:
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {
  formattedItems = items.map(formatItem);  // Computed once
}
```

3. **Use trackBy**:
```html
<div *ngFor="let item of items; trackBy: trackById">
```

</details>

---

**Next**: [RxJS](../05_rxjs/)
