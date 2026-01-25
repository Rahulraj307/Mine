# 🎯 Angular Hero Interview Roadmap 2026
## For 5+ YE Developer Leveling Up from "Rookie" to "Expert"

---

## Table of Contents
1. [Core Web + TypeScript (Foundation)](#1-core-web--typescript-foundation)
2. [Angular Fundamentals](#2-angular-fundamentals)
3. [Dependency Injection](#3-dependency-injection)
4. [Routing & Navigation](#4-routing--navigation)
5. [Forms (Reactive First)](#5-forms-reactive-first)
6. [HTTP, RxJS & Async Thinking](#6-http-rxjs--async-thinking)
7. [State Management (Practical)](#7-state-management-practical)
8. [Change Detection & Performance](#8-change-detection--performance)
9. [Modern Angular Features (15+)](#9-modern-angular-features-15)
10. [Testing](#10-testing)
11. [Build, Deploy & Environments](#11-build-deploy--environments)
12. [Security & Best Practices](#12-security--best-practices)
13. [System Design (Frontend)](#13-system-design-frontend)
14. [2026 Updates & Emerging Tech](#14-2026-updates--emerging-tech)
15. [Real Interview Projects](#15-real-interview-projects)
16. [Interview Prep Strategy](#16-interview-prep-strategy)

---

## 1. Core Web + TypeScript (Foundation)

### JavaScript Deep Dive (What Interviewers REALLY Test)

#### 1.1 Execution Context & Call Stack
```typescript
// This is where 70% of juniors fail
function outer() {
  console.log(this); // What is 'this'?
  
  function inner() {
    console.log(this); // Different 'this'!
  }
  
  inner(); // Called in global context
  inner.call(globalThis); // Explicit context
}

outer.call({ name: 'obj' }); // 'this' = { name: 'obj' }

// Arrow functions DON'T have their own 'this'
const obj = {
  method: function() {
    const arrowFn = () => {
      console.log(this); // Same 'this' as method
    };
    arrowFn();
  }
};
```

**Interview goal:** "In Angular, understanding `this` is critical for method binding in event handlers and directive decorators."

---

#### 1.2 Closures (Extremely Common in Angular)
```typescript
// Real Angular pattern: Service with private state
export class UserService {
  private userCache = new Map();
  
  getUser(id: string) {
    // Closure: inner function 'remembers' userCache
    if (this.userCache.has(id)) {
      return this.userCache.get(id);
    }
    // Fetch and cache...
  }
}

// Angular component with closure
export class SearchComponent {
  private results: any[] = [];
  
  search(term: string) {
    // Closure over 'results'
    this.api.search(term).subscribe(data => {
      this.results = data; // Remember this
    });
  }
}

// Memory leak pattern (closure holding reference)
@Component({ selector: 'app-leak' })
export class LeakComponent implements OnInit {
  ngOnInit() {
    const large = new Array(1000000);
    
    setInterval(() => {
      console.log(large.length); // CLOSURE HOLDS large FOREVER
    }, 1000);
    // This creates a memory leak!
  }
}
```

**Interview answer:** "Closures in Angular allow services to maintain private state. However, improper closure usage causes memory leaks when intervals/timers aren't cleaned up."

---

#### 1.3 Event Loop & Promises vs Observables
```typescript
// The event loop determines execution order
console.log('1. Start');

setTimeout(() => console.log('2. Timeout (Macrotask)'), 0);

Promise.resolve()
  .then(() => console.log('3. Promise (Microtask)'));

console.log('4. End');

// Output:
// 1. Start
// 4. End
// 3. Promise (Microtask)
// 2. Timeout (Macrotask)

// Why Angular chose RxJS over Promises
// Promise: Only ONE resolution, no cancellation
const promise = fetch('/api/data')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));

// You CANNOT:
// - Cancel it
// - Retry it
// - Transform it after creation
// - Emit multiple values

// Observable: All of the above
const observable$ = this.http.get('/api/data').pipe(
  retry(3),                    // Retry 3 times
  timeout(5000),              // Cancel after 5s
  switchMap(data => this.transformData(data)), // Transform
  shareReplay(1)              // Cache for subscribers
);

// Subscribers can unsubscribe
const sub = observable$.subscribe();
sub.unsubscribe(); // CANCELLATION!
```

**Interview goal:** "Angular uses RxJS because it handles cancellation, retries, and multiple emissions. Promises are one-shot async operations; Observables are composable async streams."

---

#### 1.4 Async/Await vs Promises vs Observables
```typescript
// Promise-based (old pattern)
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}

// Observable-based (Angular standard)
export class DataService {
  constructor(private http: HttpClient) {}
  
  getData() {
    return this.http.get('/api/data').pipe(
      retry({ count: 3, delay: 1000 }), // Built-in retry
      timeout(5000),                      // Automatic timeout
      catchError(err => {
        console.error(err);
        return of(null);
      })
    );
  }
}

// Mixing both (modern Angular)
async function getDataAsync() {
  const data$ = this.dataService.getData();
  const data = await firstValueFrom(data$); // Convert Observable → Promise
  return data;
}
```

**Interview goal:** "Observables are superior for Angular because they handle cancellation, retries, and composition elegantly. async/await is good for simple cases but loses the power of RxJS."

---

#### 1.5 Memory Leaks & Garbage Collection
```typescript
@Component({
  selector: 'app-bad-memory',
  template: '<p>{{ message }}</p>'
})
export class BadMemoryComponent implements OnInit {
  message: string = '';
  
  ngOnInit() {
    // ❌ MEMORY LEAK: Subscription never unsubscribed
    this.http.get('/api/data').subscribe(data => {
      this.message = data.message;
    });
    
    // ❌ MEMORY LEAK: Interval never cleared
    setInterval(() => {
      console.log('Polling...');
    }, 1000);
    
    // ❌ MEMORY LEAK: Event listener never removed
    window.addEventListener('resize', () => {
      console.log('Resized');
    });
  }
}

// ✅ CORRECT PATTERN 1: Unsubscribe manually
@Component({
  selector: 'app-good-memory-1',
  template: '<p>{{ message }}</p>'
})
export class GoodMemory1Component implements OnInit, OnDestroy {
  message: string = '';
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    this.http.get('/api/data')
      .pipe(takeUntil(this.destroy$)) // Auto-unsub when component dies
      .subscribe(data => {
        this.message = data.message;
      });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// ✅ CORRECT PATTERN 2: Use async pipe (Best)
@Component({
  selector: 'app-good-memory-2',
  template: '<p>{{ message$ | async }}</p>'
})
export class GoodMemory2Component {
  message$ = this.http.get('/api/data').pipe(
    map((data: any) => data.message)
  );
  
  constructor(private http: HttpClient) {}
  // Angular handles subscription/unsubscription!
}

// ✅ CORRECT PATTERN 3: Signals (Modern, 2025+)
@Component({
  selector: 'app-good-memory-3',
  template: '<p>{{ message() }}</p>'
})
export class GoodMemory3Component {
  message = signal('');
  
  constructor(private http: HttpClient) {
    effect(() => {
      firstValueFrom(this.http.get('/api/data')).then(
        (data: any) => this.message.set(data.message)
      );
    });
  }
  // Effect automatically cleans up when component destroys
}
```

**Interview goal:** "Memory leak prevention is non-negotiable in production Angular. Use `takeUntil`, `async` pipe, or Signals to ensure subscriptions end when components destroy."

---

### TypeScript Deep Dive

#### 1.6 Types vs Interfaces (And When Each Wins)
```typescript
// Interface: Better for object contracts, extensible
interface User {
  id: string;
  name: string;
  email: string;
}

// Extending interface
interface AdminUser extends User {
  role: 'admin';
  permissions: string[];
}

// Type: Can do everything interface does, plus unions, tuples
type ID = string | number;
type Status = 'pending' | 'success' | 'error';
type Coordinates = [number, number];

// Key difference: Declaration merging (interface only)
interface User {
  age?: number; // Can add to interface later
}

interface User {
  phone?: string; // This works!
}

// Type alias CANNOT do this:
type Person = { id: string };
type Person = { name: string }; // ❌ ERROR: Duplicate identifier

// Angular example: Interface for API response
interface UserResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
  };
}

// Type for state
type AppState = {
  users: User[];
  loading: boolean;
  error: string | null;
};
```

**Interview answer:** "Interfaces are better for describing object shapes and allow declaration merging. Types are better for unions and complex expressions. Use interfaces for entities, types for state/unions."

---

#### 1.7 Generics (Used EVERYWHERE in Angular)
```typescript
// Generic service
export class GenericService<T> {
  private items: T[] = [];
  
  add(item: T): void {
    this.items.push(item);
  }
  
  getAll(): T[] {
    return this.items;
  }
}

// Usage
const userService = new GenericService<User>();
const todoService = new GenericService<Todo>();

// Generic HTTP calls (Angular standard)
export class UserService {
  constructor(private http: HttpClient) {}
  
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }
  
  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }
}

// Generics with constraints (VERY COMMON in Angular)
interface Entity {
  id: string;
}

export class BaseService<T extends Entity> {
  constructor(private http: HttpClient, private endpoint: string) {}
  
  get(id: string): Observable<T> {
    return this.http.get<T>(`${this.endpoint}/${id}`);
  }
  
  create(item: T): Observable<T> {
    return this.http.post<T>(this.endpoint, item);
  }
}

// Usage
class UserService extends BaseService<User> {
  constructor(http: HttpClient) {
    super(http, '/api/users');
  }
}

// Generic with multiple type parameters
type ApiResponse<T, E = string> = {
  data: T | null;
  error: E | null;
};

function handleResponse<T>(response: ApiResponse<T>) {
  if (response.error) {
    console.error(response.error);
  } else {
    console.log(response.data);
  }
}
```

**Interview goal:** "Generics are essential for writing reusable, type-safe Angular code. They're used in services, components, and all the major APIs."

---

#### 1.8 Union & Intersection Types
```typescript
// Union: Can be one of several types
type Status = 'pending' | 'loading' | 'success' | 'error';
type ID = string | number;

// Function overloading with union
function getId(user: User | Admin): string {
  if ('role' in user) {
    return `${user.id}-admin`;
  }
  return user.id;
}

// Intersection: Has ALL properties
type HasTimestamp = {
  createdAt: Date;
  updatedAt: Date;
};

type HasAuthor = {
  author: string;
};

type BlogPost = HasTimestamp & HasAuthor & {
  title: string;
  content: string;
};

// Real Angular example: Form state
type FormState = {
  data: any;
} & {
  status: 'clean' | 'dirty';
  errors: Record<string, string[]>;
};

// Discriminated union (VERY POWERFUL)
type Result<T> = 
  | { status: 'success'; data: T }
  | { status: 'error'; error: string }
  | { status: 'loading' };

function handleResult<T>(result: Result<T>) {
  switch (result.status) {
    case 'success':
      console.log(result.data); // TypeScript knows 'data' exists
      break;
    case 'error':
      console.log(result.error); // TypeScript knows 'error' exists
      break;
    case 'loading':
      console.log('Loading...');
  }
}
```

**Interview goal:** "Union types model state elegantly. Discriminated unions (status pattern) are the most type-safe way to handle multiple states in Angular."

---

#### 1.9 Utility Types (Picked, Omit, Partial, Required, etc.)
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

// Partial: All properties optional
type PartialUser = Partial<User>;
const user: PartialUser = { name: 'John' }; // ✅ Valid

// Required: All properties required
type RequiredUser = Required<User>;

// Pick: Select specific properties
type UserPreview = Pick<User, 'id' | 'name' | 'email'>;
const preview: UserPreview = {
  id: '1',
  name: 'John',
  email: 'john@example.com'
  // password and role are not allowed
};

// Omit: Exclude specific properties (Opposite of Pick)
type UserPublic = Omit<User, 'password'>;

// Record: Create object with specific keys
type UserRoles = Record<'admin' | 'user' | 'guest', User>;
const roles: UserRoles = {
  admin: { /* full user */ },
  user: { /* full user */ },
  guest: { /* full user */ }
};

// Readonly: All properties read-only
type ReadonlyUser = Readonly<User>;

// Real Angular example: Component inputs
@Component({
  selector: 'app-user-form',
  template: '<form>'
})
export class UserFormComponent {
  @Input() initialUser?: Partial<User>; // User can pass partial data
  @Output() save = new EventEmitter<Omit<User, 'id'>>(); // Emit without ID
}
```

**Interview goal:** "Utility types are essential for creating flexible, type-safe APIs. `Partial<T>`, `Omit<T>`, `Pick<T>` are the most common in Angular."

---

#### 1.10 Readonly & Strict Mode
```typescript
// Readonly: Property cannot be reassigned
interface ImmutableUser {
  readonly id: string;
  readonly name: string;
  email: string; // Can be changed
}

const user: ImmutableUser = { id: '1', name: 'John', email: 'j@example.com' };
user.email = 'newemail@example.com'; // ✅ OK
user.id = '2'; // ❌ ERROR: Cannot assign to readonly property

// Readonly array
const numbers: readonly number[] = [1, 2, 3];
// numbers.push(4); // ❌ ERROR

// Angular Signal (inherently readonly at value level)
const count = signal(0);
count.set(1); // ✅ Use set() method
count(); // ✅ Read value
// count = signal(1); // ❌ Cannot reassign signal itself

// Private fields (ES2022, TypeScript)
class UserService {
  #apiKey: string = 'secret'; // True privacy (not just readonly)
  
  private name: string = 'John'; // Compile-time privacy only
  
  constructor() {
    console.log(this.#apiKey); // ✅ Can access
  }
}

// Strict mode implications
// "strict": true in tsconfig.json enables:
// - strictNullChecks: null/undefined checks
// - strictFunctionTypes: Stricter function comparison
// - strictBindCallApply: Stricter call/apply/bind
// - strictPropertyInitialization: Property must be initialized
// - noImplicitThis: 'this' must have explicit type
// - alwaysStrict: 'use strict' in all files
// - noImplicitAny: No implicit 'any' type

// Real impact on code:
interface User {
  name: string;
  email?: string; // Optional
}

const user: User = { name: 'John' };
console.log(user.email.length); // ❌ ERROR with strictNullChecks
console.log(user.email?.length); // ✅ Correct: optional chaining
```

**Interview goal:** "Strict mode in TypeScript prevents entire classes of bugs. It's essential for production Angular apps. Always enable it."

---

---

## 2. Angular Fundamentals

### 2.1 What is Angular? (Not just a framework)

```typescript
// Angular is:
// 1. A FRAMEWORK (opinionated structure)
// 2. Built on TypeScript
// 3. Component-based architecture
// 4. Two-way data binding
// 5. Dependency Injection
// 6. RxJS observables
// 7. Change detection

// Angular vs AngularJS
// AngularJS (1.x): Controllers, 2-way binding, mutable state
// Angular 2+: Components, immutable-first, reactive

// SPA vs MPA
// SPA: Single HTML file, client-side routing, fast navigation
// MPA: Multiple HTML files, server-side routing, SEO friendly

@Component({
  selector: 'app-root',
  template: `
    <h1>{{ title }}</h1>
    <app-todo [items]="todos" (add)="addTodo($event)"></app-todo>
  `
})
export class AppComponent {
  title = 'My App';
  todos: Todo[] = [];
  
  addTodo(todo: Todo) {
    this.todos.push(todo);
  }
}
```

---

### 2.2 Component Lifecycle Hooks (When Each Fires)

```typescript
@Component({
  selector: 'app-lifecycle',
  template: '<p>{{ message }}</p>'
})
export class LifecycleComponent implements 
  OnInit, 
  OnChanges, 
  OnDestroy, 
  AfterViewInit,
  OnAfterContentInit {
  
  @Input() inputValue: string = '';
  @ViewChild('myDiv') myDiv!: ElementRef;
  
  // 1. ngOnChanges: When @Input() properties change
  ngOnChanges(changes: SimpleChanges) {
    console.log('Input changed:', changes);
    // Called BEFORE ngOnInit on first change
  }
  
  // 2. ngOnInit: After constructor, after @Input() set
  ngOnInit() {
    console.log('Component initialized');
    // FETCH DATA HERE
    this.loadData();
  }
  
  // 3. ngDoCheck: Every change detection cycle
  ngDoCheck() {
    console.log('Custom change detection');
    // Only if you need custom detection logic
    // Usually avoid this!
  }
  
  // 4. ngAfterContentInit: After content projected
  ngAfterContentInit() {
    console.log('Content initialized');
    // <ng-content> is available
  }
  
  // 5. ngAfterViewInit: After view rendered
  ngAfterViewInit() {
    console.log('View initialized');
    // @ViewChild elements are available now
    this.myDiv.nativeElement.focus();
  }
  
  // 6. ngDestroy: Before component destroyed
  ngDestroy() {
    console.log('Component destroyed');
    // CLEANUP HERE: unsubscribe, clear timers
  }
  
  private loadData() {
    // Use async pipe or takeUntil pattern
  }
}

// Real-world example: Form component
@Component({
  selector: 'app-form',
  template: `
    <form [formGroup]="form">
      <input formControlName="name">
      <button (click)="submit()">Save</button>
    </form>
  `
})
export class FormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  private destroy$ = new Subject<void>();
  
  constructor(private fb: FormBuilder) {}
  
  ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required]
    });
    
    // Watch form changes
    this.form.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => console.log('Form status:', status));
  }
  
  submit() {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Interview answer:** "Use `ngOnInit` for initialization, `ngAfterViewInit` for DOM access, and `ngOnDestroy` for cleanup. Most components only need `ngOnInit` and `ngOnDestroy`."

---

### 2.3 Smart vs Dumb Components (Container Pattern)

```typescript
// SMART COMPONENT (Container)
// - Has business logic
// - Makes API calls
// - Manages state
// - Knows about services
@Component({
  selector: 'app-user-list',
  template: `
    <div *ngIf="loading$ | async">Loading...</div>
    <div *ngIf="error$ | async as error">Error: {{ error }}</div>
    <app-user-item 
      *ngFor="let user of users$ | async"
      [user]="user"
      (delete)="deleteUser($event)">
    </app-user-item>
  `
})
export class UserListComponent implements OnInit {
  users$ = this.store.select(selectUsers);
  loading$ = this.store.select(selectLoading);
  error$ = this.store.select(selectError);
  
  constructor(private store: Store) {}
  
  ngOnInit() {
    this.store.dispatch(loadUsers());
  }
  
  deleteUser(id: string) {
    this.store.dispatch(deleteUser({ id }));
  }
}

// DUMB COMPONENT (Presentational)
// - No business logic
// - Pure input/output
// - Reusable
// - Testable
@Component({
  selector: 'app-user-item',
  template: `
    <div class="user-card">
      <h3>{{ user.name }}</h3>
      <p>{{ user.email }}</p>
      <button (click)="onDelete()">Delete</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserItemComponent {
  @Input() user!: User;
  @Output() delete = new EventEmitter<string>();
  
  onDelete() {
    this.delete.emit(this.user.id);
  }
}

// Benefits of this pattern:
// - Smart components handle logic
// - Dumb components are highly reusable
// - Easy to test dumb components (just check @Input/@Output)
// - Scalable architecture for large teams
```

**Interview goal:** "Smart/Dumb separation makes code testable and scalable. It's the foundation of enterprise Angular architecture."

---

### 2.4 Standalone Components (Angular 15+, Now Standard)

```typescript
// OLD WAY: NgModule required
@NgModule({
  declarations: [UserComponent],
  imports: [CommonModule, FormsModule],
  providers: [UserService]
})
export class UserModule {}

// NEW WAY: Standalone components (NO NgModule needed)
@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule], // Import directly!
  providers: [UserService], // Provide services
  template: `
    <div>
      <h1>{{ user.name }}</h1>
      <button (click)="updateName()">Update</button>
    </div>
  `
})
export class UserComponent implements OnInit {
  user: User = { id: '1', name: 'John' };
  
  constructor(private userService: UserService) {}
  
  ngOnInit() {
    this.user = this.userService.getUser('1');
  }
  
  updateName() {
    this.user.name = 'Jane';
  }
}

// Bootstrap standalone app (no AppModule!)
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations()
  ]
});

// Benefits:
// - Less boilerplate (no NgModule)
// - Tree-shakable (only import what you need)
// - Easier onboarding for new developers
// - Lazy loading is simpler

// Standalone route lazy loading
const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => 
      import('./admin/admin.component').then(m => m.AdminComponent)
  }
];
```

**Interview goal:** "Standalone components are now the standard in Angular 15+. They reduce boilerplate and make lazy loading simpler."

---

### 2.5 Input/Output vs Shared Services

```typescript
// Pattern 1: @Input/@Output (Parent-Child, one-way)
// PROS: Clear data flow, easy to test, prevents circular logic
// CONS: Only for immediate parent-child relationship

@Component({
  selector: 'app-parent',
  template: `
    <app-child 
      [title]="pageTitle"
      (titleChange)="onTitleChange($event)">
    </app-child>
  `
})
export class ParentComponent {
  pageTitle = 'Home';
  
  onTitleChange(newTitle: string) {
    this.pageTitle = newTitle;
  }
}

@Component({
  selector: 'app-child',
  template: `
    <h1>{{ title }}</h1>
    <button (click)="changeTitle()">Change</button>
  `
})
export class ChildComponent {
  @Input() title!: string;
  @Output() titleChange = new EventEmitter<string>();
  
  changeTitle() {
    this.titleChange.emit('New Title');
  }
}

// Pattern 2: Shared Service (Any component, any relationship)
// PROS: Flexible, can share complex state
// CONS: Potential memory leaks if not managed

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private theme$ = new BehaviorSubject<'light' | 'dark'>('light');
  
  getTheme() {
    return this.theme$.asObservable();
  }
  
  setTheme(theme: 'light' | 'dark') {
    this.theme$.next(theme);
  }
}

@Component({
  selector: 'app-header',
  template: `<button (click)="toggleTheme()">{{ theme$ | async }}</button>`
})
export class HeaderComponent {
  theme$ = this.themeService.getTheme();
  
  constructor(private themeService: ThemeService) {}
  
  toggleTheme() {
    const current = this.theme$.getValue();
    this.themeService.setTheme(current === 'light' ? 'dark' : 'light');
  }
}

@Component({
  selector: 'app-body',
  template: `<div [class]="theme$ | async">Content</div>`
})
export class BodyComponent {
  theme$ = this.themeService.getTheme();
  
  constructor(private themeService: ThemeService) {}
}

// Pattern 3: Signal-based State (Modern, 2025+)
@Injectable({ providedIn: 'root' })
export class ThemeSignalService {
  theme = signal<'light' | 'dark'>('light');
  
  setTheme(theme: 'light' | 'dark') {
    this.theme.set(theme);
  }
}

@Component({
  selector: 'app-modern',
  template: `<div [class]="themeService.theme()">Content</div>`
})
export class ModernComponent {
  constructor(readonly themeService: ThemeSignalService) {}
}
```

**Interview goal:** "Use @Input/@Output for parent-child, services for sibling/distant components, signals for modern reactive state."

---

### 2.6 Templates & Binding Types

```typescript
// 1. INTERPOLATION: {{ }}
@Component({
  template: `<h1>{{ title }}</h1>`
})
export class InterpolationComponent {
  title = 'Hello Angular';
}

// 2. PROPERTY BINDING: [property]="expression"
@Component({
  template: `
    <img [src]="imageUrl">
    <button [disabled]="isDisabled">Click</button>
    <div [innerText]="message"></div>
  `
})
export class PropertyBindingComponent {
  imageUrl = 'assets/photo.jpg';
  isDisabled = false;
  message = 'Hello';
}

// 3. ATTRIBUTE BINDING: [attr.attribute]="expression"
// (Use when property binding not available)
@Component({
  template: `<table [attr.aria-label]="'Users table'"></table>`
})
export class AttributeBindingComponent {}

// 4. CLASS BINDING: [class.className]="expression"
@Component({
  template: `
    <div [class.active]="isActive">Active</div>
    <div [class]="{ active: isActive, disabled: isDisabled }">Dynamic</div>
    <div [ngClass]="classMap">Map</div>
  `
})
export class ClassBindingComponent {
  isActive = true;
  isDisabled = false;
  classMap = { 'btn': true, 'btn-primary': true };
}

// 5. STYLE BINDING: [style.property]="expression"
@Component({
  template: `
    <div [style.color]="'red'">Red text</div>
    <div [style]="{ color: textColor, fontSize: fontSize }">Dynamic</div>
    <div [ngStyle]="styleMap">Map</div>
  `
})
export class StyleBindingComponent {
  textColor = 'blue';
  fontSize = '18px';
  styleMap = { color: 'green', fontWeight: 'bold' };
}

// 6. EVENT BINDING: (event)="handler()"
@Component({
  template: `
    <button (click)="onClick()">Click</button>
    <input (keyup)="onKeyUp($event)">
    <input (change)="onChange($event.target.value)">
  `
})
export class EventBindingComponent {
  onClick() { console.log('Clicked'); }
  onKeyUp(event: Event) { console.log((event.target as HTMLInputElement).value); }
  onChange(value: string) { console.log(value); }
}

// 7. TWO-WAY BINDING: [(ngModel)]="property"
// (Old pattern, avoid if possible)
@Component({
  template: `<input [(ngModel)]="name">`
})
export class TwoWayComponent {
  name = '';
  // Equivalent to: [ngModel]="name" (ngModelChange)="name = $event"
}

// 8. TEMPLATE REFERENCE VARIABLES: #variable
@Component({
  template: `
    <input #nameInput type="text">
    <button (click)="saveName(nameInput.value)">Save</button>
  `
})
export class TemplateRefComponent {
  saveName(name: string) {
    console.log(name);
  }
}

// 9. PIPES: {{ value | pipe:arg1:arg2 }}
@Component({
  template: `
    <p>{{ date | date:'shortDate' }}</p>
    <p>{{ price | currency:'USD' }}</p>
    <p>{{ text | uppercase }}</p>
    <p>{{ obj | json }}</p>
  `
})
export class PipesComponent {
  date = new Date();
  price = 99.99;
  text = 'hello';
  obj = { name: 'John' };
}

// 10. CUSTOM PIPES
@Pipe({ name: 'highlight', standalone: true })
export class HighlightPipe implements PipeTransform {
  transform(value: string, term: string): string {
    if (!term) return value;
    return value.replace(
      new RegExp(`(${term})`, 'gi'),
      '<mark>$1</mark>'
    );
  }
}

@Component({
  template: `<p [innerHTML]="text | highlight:'Angular'"></p>`,
  imports: [HighlightPipe]
})
export class CustomPipeComponent {
  text = 'I love Angular';
}

// 11. PURE VS IMPURE PIPES
@Pipe({ name: 'filter', pure: false }) // ⚠️ Impure (called every change detection)
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchTerm: string): any[] {
    return items.filter(item => item.includes(searchTerm));
  }
}

// Pure pipes are better (called only when input changes)
@Pipe({ name: 'sort', pure: true }) // ✅ Pure
export class SortPipe implements PipeTransform {
  transform(items: any[]): any[] {
    return items.sort();
  }
}
```

**Interview goal:** "Know all binding types. Two-way binding is outdated; prefer reactive forms. Custom pipes should be pure for performance."

---

### 2.7 Directives (Structural vs Attribute)

```typescript
// STRUCTURAL DIRECTIVES: Modify DOM structure
// *ngIf, *ngFor, *ngSwitch

@Component({
  template: `
    <!-- *ngIf: Show/hide element -->
    <div *ngIf="isVisible">Visible</div>
    
    <!-- *ngFor: Loop and create elements -->
    <li *ngFor="let item of items; let i = index; let last = last">
      {{ i }}: {{ item }}
      <span *ngIf="last">(Last item)</span>
    </li>
    
    <!-- *ngSwitch: Conditional rendering -->
    <div [ngSwitch]="status">
      <div *ngSwitchCase="'loading'">Loading...</div>
      <div *ngSwitchCase="'success'">Success!</div>
      <div *ngSwitchDefault>Error</div>
    </div>
  `
})
export class StructuralComponent {
  isVisible = true;
  items = ['A', 'B', 'C'];
  status = 'loading';
}

// MODERN CONTROL FLOW (Angular 17+): @if, @for, @switch
@Component({
  template: `
    <!-- @if: Better than *ngIf -->
    @if (isVisible) {
      <div>Visible</div>
    } @else {
      <div>Hidden</div>
    }
    
    <!-- @for: Better than *ngFor -->
    @for (let item of items; track item.id) {
      <li>{{ item }}</li>
    }
    
    <!-- @switch: Better than ngSwitch -->
    @switch (status) {
      @case ('loading') {
        <div>Loading...</div>
      }
      @case ('success') {
        <div>Success!</div>
      }
      @default {
        <div>Error</div>
      }
    }
  `
})
export class ModernControlFlowComponent {
  isVisible = true;
  items = [{ id: 1 }, { id: 2 }];
  status = 'loading';
}

// ATTRIBUTE DIRECTIVES: Modify element attributes/behavior
// [ngClass], [ngStyle], [ngModel], ngDisabled, etc.

// CUSTOM ATTRIBUTE DIRECTIVE
@Directive({
  selector: '[appHighlight]'
})
export class HighlightDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {}
  
  @HostListener('mouseenter')
  onMouseEnter() {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', 'yellow');
  }
  
  @HostListener('mouseleave')
  onMouseLeave() {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', 'transparent');
  }
  
  @Input() set appHighlight(color: string) {
    this.renderer.setStyle(this.el.nativeElement, 'background-color', color);
  }
}

@Component({
  template: `<div appHighlight="lightblue">Hover me</div>`
})
export class DirectiveExampleComponent {}

// @defer blocks (NEW in Angular 17+): Lazy-load non-critical content
@Component({
  template: `
    <!-- Render immediately -->
    <h1>Main content</h1>
    
    <!-- Defer heavy component until idle -->
    @defer (on viewport) {
      <app-heavy-chart></app-heavy-chart>
    } @placeholder {
      <p>Loading chart...</p>
    } @loading {
      <p>Loading chart...</p>
    }
  `
})
export class DeferBlockComponent {}
```

**Interview goal:** "Modern Angular (17+) uses @if, @for, @switch instead of *ngIf, *ngFor, *ngSwitch. Use @defer for heavy components to improve initial load."

---

---

## 3. Dependency Injection

### 3.1 What DI is and Why Angular Uses It

```typescript
// WITHOUT DI: Hard to test, tightly coupled
export class UserComponent {
  private userService = new UserService(); // TIGHT COUPLING
  
  loadUser() {
    this.userService.getUser('1');
  }
}

// WITH DI: Decoupled, easy to test, flexible
@Component({
  selector: 'app-user'
})
export class UserComponent {
  constructor(private userService: UserService) {} // LOOSE COUPLING
  
  loadUser() {
    this.userService.getUser('1');
  }
}

// Why DI matters:
// 1. TESTABILITY: Inject mock service
// 2. FLEXIBILITY: Swap implementations
// 3. CENTRALIZED CONFIG: Providers define how to create services
// 4. LIFECYCLE MANAGEMENT: Angular manages service instances
// 5. SINGLETON PATTERN: One instance per injector

// Example: Testing without DI is painful
export class BadUserComponent {
  private apiService = new HttpService(); // Real HTTP calls
  
  async loadUser() {
    const user = await this.apiService.get('/users/1');
    console.log(user);
  }
}

// Testing requires: Mocking HTTP calls, mocking fetch, etc. NIGHTMARE

// Example: Testing with DI is easy
@Component({
  selector: 'app-user'
})
export class UserComponent {
  constructor(private userService: UserService) {}
  
  loadUser() {
    this.userService.getUser('1');
  }
}

// In tests:
const mockUserService = {
  getUser: jasmine.createSpy().and.returnValue({ id: '1', name: 'John' })
};

TestBed.configureTestingModule({
  declarations: [UserComponent],
  providers: [
    { provide: UserService, useValue: mockUserService }
  ]
});

const component = TestBed.createComponent(UserComponent);
component.componentInstance.loadUser();
expect(mockUserService.getUser).toHaveBeenCalledWith('1');
```

---

### 3.2 Providers: root, module, component level

```typescript
// LEVEL 1: ROOT LEVEL (Recommended for singletons)
// One instance across entire app
@Injectable({
  providedIn: 'root' // Singleton, tree-shakable
})
export class ConfigService {
  config = { apiUrl: 'https://api.example.com' };
}

// LEVEL 2: MODULE LEVEL (Older pattern)
@NgModule({
  providers: [UserService] // Singleton per module
})
export class UserModule {}

// LEVEL 3: COMPONENT LEVEL (New instance per component)
@Component({
  selector: 'app-counter',
  providers: [CounterService] // New instance every time
})
export class CounterComponent {
  constructor(private counterService: CounterService) {}
}

// Real-world example: Different scopes
@Injectable({ providedIn: 'root' })
export class ConfigService {
  // Shared across entire app
}

@Injectable()
export class UserService {
  // Must be provided manually
  constructor(private config: ConfigService) {}
}

@Injectable()
export class AuthService {
  // Session-specific instance
  private currentUser: User | null = null;
  
  constructor(private userService: UserService) {}
}

@Component({
  selector: 'app-login',
  providers: [AuthService] // New AuthService instance for this component
})
export class LoginComponent {
  constructor(private authService: AuthService) {}
}

// Why this matters:
// - Root: Config, API service, store → shared state
// - Module: Rarely used now (standalone replaced NgModule)
// - Component: Service that needs instance isolation
```

---

### 3.3 Hierarchical Injectors & Provider Scope

```typescript
// Angular has a HIERARCHY of injectors
// AppComponent
//   ├─ HeaderComponent
//   └─ MainComponent
//       ├─ UserListComponent
//       └─ UserDetailComponent

// If a service is provided at UserDetailComponent level,
// parent components (MainComponent, AppComponent) CANNOT use it

@Injectable({ providedIn: 'root' })
export class AppService {
  // Available everywhere
}

@Component({
  selector: 'app-main',
  providers: [MainService]
})
export class MainComponent {
  // MainService only available to MainComponent and children
  // AppComponent cannot access MainService
}

@Component({
  selector: 'app-user-detail',
  providers: [UserDetailService]
})
export class UserDetailComponent {
  constructor(
    private appService: AppService, // ✅ Available (root)
    private mainService: MainService, // ✅ Available (parent)
    private detailService: UserDetailService // ✅ Available (own)
  ) {}
}

// Memory implications:
// - Root: 1 instance for entire app
// - Module: 1 instance per module
// - Component: New instance per component → MEMORY LEAK RISK!

// Bad practice: Heavy service at component level
@Component({
  providers: [HttpService] // New HttpService for every instance!
})
export class BadComponent {
  // If 1000 instances of BadComponent exist, 1000 HttpService instances!
}

// Good practice: Light service at component level
@Component({
  providers: [CartService] // Isolated cart per user session
})
export class CartComponent {
  // Each user's cart is separate
}
```

---

### 3.4 useClass, useValue, useFactory, useExisting

```typescript
// 1. useClass: Default, creates new instance
@Injectable()
export class UserService {}

// Explicit version:
providers: [
  { provide: UserService, useClass: UserService }
]

// 2. useValue: Use a constant value
const API_CONFIG = {
  url: 'https://api.example.com',
  timeout: 5000
};

providers: [
  { provide: 'API_CONFIG', useValue: API_CONFIG }
]

@Component({
  constructor(@Inject('API_CONFIG') config: any) {}
}

// 3. useFactory: Create instance with custom logic
export function userServiceFactory(http: HttpClient) {
  if (environment.production) {
    return new ProductionUserService(http);
  } else {
    return new MockUserService();
  }
}

providers: [
  { 
    provide: UserService, 
    useFactory: userServiceFactory,
    deps: [HttpClient] // Dependencies for factory
  }
]

// 4. useExisting: Alias for existing provider
@Injectable()
export class OldUserService {}

@Injectable()
export class NewUserService {}

providers: [
  NewUserService,
  { provide: OldUserService, useExisting: NewUserService } // Backward compatibility
]

// Real-world example: Environment-based services
@Injectable({ providedIn: 'root' })
export class LoggerService {
  log(message: string) { console.log(message); }
}

export class LocalStorageLoggerService extends LoggerService {
  log(message: string) {
    super.log(message);
    localStorage.setItem('logs', message);
  }
}

// In app module:
providers: [
  {
    provide: LoggerService,
    useClass: environment.production 
      ? LoggerService 
      : LocalStorageLoggerService
  }
]
```

---

### 3.5 Injection Tokens

```typescript
// String tokens (avoid, not type-safe)
const API_URL = 'API_URL';

providers: [
  { provide: API_URL, useValue: 'https://api.example.com' }
]

// Class tokens (better)
@Injectable()
export class ApiService {}

providers: [ApiService]

// InjectionToken (best, type-safe)
export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG');

interface ApiConfig {
  url: string;
  timeout: number;
}

// In module:
providers: [
  {
    provide: API_CONFIG,
    useValue: { url: 'https://api.example.com', timeout: 5000 }
  }
]

// In component:
@Injectable()
export class ApiService {
  constructor(@Inject(API_CONFIG) private config: ApiConfig) {
    console.log(this.config.url);
  }
}

// Optional injection
export class OptionalComponent {
  constructor(@Optional() private logger?: LoggerService) {
    if (this.logger) {
      this.logger.log('Logger available');
    }
  }
}

// Self injection (don't look in parent injectors)
@Component({
  providers: [ServiceA]
})
export class ComponentA {
  constructor(@Self() private serviceA: ServiceA) {
    // Only uses ServiceA from this component's injector
  }
}

// SkipSelf (look in parent injectors, not own)
export class ComponentB {
  constructor(@SkipSelf() private serviceA: ServiceA) {
    // Uses ServiceA from parent, ignoring own providers
  }
}
```

---

### 3.6 Tree-Shakable Providers (2025+ Standard)

```typescript
// OLD WAY: Module-based (Not tree-shakable)
@NgModule({
  providers: [UserService, TodoService, NotificationService]
})
export class AppModule {}

// If you only use UserService, the other two are still bundled!

// NEW WAY: providedIn: 'root' (Tree-shakable)
@Injectable({
  providedIn: 'root' // Angular removes if unused
})
export class UserService {}

@Injectable({
  providedIn: 'root'
})
export class TodoService {}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {}

// If you only inject UserService, others are removed by tree-shaking!

// You can also tree-shake to specific modules
export const USER_FEATURES = new InjectionToken<string>('USER_FEATURES');

@Injectable({
  providedIn: 'root' // Or providedIn: 'platform'
})
export class UserService {}

// Real impact:
// - Old way: All services always bundled
// - New way: Only injected services bundled
// - Result: Smaller bundle sizes (30-50% reduction possible)
```

---

---

## 4. Routing & Navigation

### 4.1 Router Basics & Route Guards

```typescript
// Route configuration
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'users/:id', component: UserDetailComponent },
  { path: 'admin', component: AdminComponent, canActivate: [AdminGuard] },
  { path: '**', component: NotFoundComponent }
];

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)]
});

// Class-based guards (old, still used)
@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService) {}
  
  canActivate(): boolean {
    return this.authService.isAdmin();
  }
}

// Functional guards (new, recommended)
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return authService.isAdmin();
};

// Routes with functional guards
const routes: Routes = [
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] }
];

// Multiple guards
const routes: Routes = [
  { 
    path: 'admin', 
    component: AdminComponent, 
    canActivate: [adminGuard, loginGuard]
  }
];

// Guard types:
// - canActivate: Can enter route?
// - canDeactivate: Can leave route?
// - resolve: Load data before entering
// - canMatch: Can match route?

@Injectable({ providedIn: 'root' })
export class UnsavedChangesGuard implements CanDeactivateFn {
  canDeactivate(component: FormComponent): boolean {
    if (component.form.dirty) {
      return confirm('You have unsaved changes. Leave anyway?');
    }
    return true;
  }
}

const routes: Routes = [
  { 
    path: 'edit', 
    component: FormComponent, 
    canDeactivate: [UnsavedChangesGuard]
  }
];
```

---

### 4.2 Lazy Loading (Critical for Performance)

```typescript
// Without lazy loading: All modules bundled upfront
const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'reports', component: ReportsComponent }
];

// With lazy loading: Modules loaded on demand
const routes: Routes = [
  { 
    path: 'dashboard', 
    loadComponent: () => 
      import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  { 
    path: 'admin', 
    loadChildren: () => 
      import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  { 
    path: 'reports', 
    loadComponent: () => 
      import('./reports/reports.component').then(m => m.ReportsComponent),
    data: { preload: true } // Hint to preload strategy
  }
];

// Real-world bundle impact:
// Without lazy loading: 500KB (all features upfront)
// With lazy loading: 100KB initial + 100KB per feature
// Result: 5x faster initial load!

// Usage in component
@Component({
  template: `<a routerLink="/admin">Admin</a>`
})
export class NavigationComponent {}

// Programmatic navigation
@Component({
  template: `<button (click)="goToUser(1)">User 1</button>`
})
export class UserComponent {
  constructor(private router: Router) {}
  
  goToUser(id: number) {
    this.router.navigate(['/users', id]);
  }
  
  goBack() {
    window.history.back();
  }
}
```

---

### 4.3 Route Resolvers (Load Data Before Entering)

```typescript
// Functional resolver (new)
export const userResolver: ResolveFn<User> = (route) => {
  const userService = inject(UserService);
  return userService.getUser(route.paramMap.get('id')!);
};

const routes: Routes = [
  {
    path: 'users/:id',
    component: UserDetailComponent,
    resolve: { user: userResolver }
  }
];

@Component({
  selector: 'app-user-detail',
  template: `<h1>{{ user.name }}</h1>`
})
export class UserDetailComponent implements OnInit {
  user!: User;
  
  constructor(private route: ActivatedRoute) {}
  
  ngOnInit() {
    this.route.data.subscribe(data => {
      this.user = data['user'];
    });
  }
}

// Class-based resolver (old, still works)
@Injectable({ providedIn: 'root' })
export class UserResolver implements Resolve<User> {
  constructor(private userService: UserService) {}
  
  resolve(route: ActivatedRouteSnapshot): Observable<User> {
    return this.userService.getUser(route.paramMap.get('id')!);
  }
}

const routes: Routes = [
  {
    path: 'users/:id',
    component: UserDetailComponent,
    resolve: { user: UserResolver }
  }
];

// Benefit: Data is available BEFORE component renders
// No "loading" state needed in component
```

---

### 4.4 Preloading Strategies

```typescript
// Strategy 1: No preloading (default)
bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)]
});

// Strategy 2: Preload all lazy routes
bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes, withPreloading(PreloadAllModules))]
});

// Benefit: After initial load is complete, download lazy modules in background
// Faster navigation experience without initial bundle bloat

// Strategy 3: Custom preload strategy
@Injectable({ providedIn: 'root' })
export class CustomPreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Preload only routes marked with data: { preload: true }
    if (route.data && route.data['preload']) {
      return load();
    }
    return of(null);
  }
}

const routes: Routes = [
  { 
    path: 'reports', 
    loadComponent: () => import('./reports.component'),
    data: { preload: true } // Will be preloaded
  }
];

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes, withPreloading(CustomPreloadStrategy))]
});

// Real impact:
// Default: 100KB, lazy modules load on navigation (1-2s delay)
// PreloadAllModules: 500KB, zero navigation delay
// Custom: 250KB, strategically preload important features
```

---

### 4.5 Route Reuse Strategy (Advanced Performance)

```typescript
// Problem: Navigating to same component with different params recreates component

@Component({
  selector: 'app-user-detail',
  template: `<h1>{{ user.name }}</h1>`
})
export class UserDetailComponent implements OnInit {
  user!: User;
  
  constructor(private route: ActivatedRoute, private userService: UserService) {}
  
  ngOnInit() {
    // ❌ Problem: Called every time params change, even if same component
    this.userService.getUser(this.route.snapshot.paramMap.get('id')!).subscribe(
      user => this.user = user
    );
  }
}

// Solution: Custom RouteReuseStrategy
@Injectable({ providedIn: 'root' })
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  private handlers: Map<ActivatedRouteSnapshot, DetachedRouteHandle> = new Map();
  
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return true; // Cache all routes
  }
  
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    this.handlers.set(route, handle);
  }
  
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return this.handlers.has(route);
  }
  
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return this.handlers.get(route) || null;
  }
  
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig; // Reuse if same component
  }
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy }
  ]
});

// Benefit: Component instance is preserved, no re-initialization
// Use case: Heavy components (dashboards, editors) that are expensive to create
```

---

---

## 5. Forms (Reactive First)

### 5.1 Reactive Forms Deep Dive

```typescript
// REACTIVE FORMS: Explicit, testable, scalable
// Built on FormControl, FormGroup, FormArray

export class UserFormComponent implements OnInit {
  form!: FormGroup;
  
  constructor(private fb: FormBuilder) {}
  
  ngOnInit() {
    this.form = this.fb.group({
      firstName: ['John', Validators.required],
      lastName: ['Doe', [Validators.required, Validators.minLength(2)]],
      email: ['john@example.com', [Validators.required, Validators.email]],
      phone: [''],
      address: this.fb.group({
        street: ['123 Main St', Validators.required],
        city: ['Springfield', Validators.required],
        zip: ['12345', Validators.pattern(/^\d{5}$/)]
      }),
      hobbies: this.fb.array([
        new FormControl('Reading'),
        new FormControl('Gaming')
      ]),
      subscribe: [true] // Default value
    });
    
    // Watch form status
    this.form.statusChanges
      .pipe(debounceTime(300))
      .subscribe(status => console.log('Form status:', status));
    
    // Watch specific field
    this.form.get('email')!.valueChanges
      .pipe(
        debounceTime(500),
        switchMap(email => this.checkEmailUniqueness(email))
      )
      .subscribe(exists => {
        if (exists) {
          this.form.get('email')!.setErrors({ 'emailExists': true });
        }
      });
  }
  
  submit() {
    if (this.form.valid) {
      console.log(this.form.value);
      // { firstName: 'John', lastName: 'Doe', ..., address: {...}, hobbies: [...] }
    }
  }
  
  // Dynamic form control
  addHobby() {
    (this.form.get('hobbies') as FormArray).push(new FormControl(''));
  }
  
  removeHobby(index: number) {
    (this.form.get('hobbies') as FormArray).removeAt(index);
  }
  
  // Check email uniqueness from server
  private checkEmailUniqueness(email: string): Observable<boolean> {
    return this.http.get<{ exists: boolean }>(`/api/check-email?email=${email}`).pipe(
      map(res => res.exists),
      catchError(() => of(false))
    );
  }
}

// Template
@Component({
  selector: 'app-user-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <!-- Simple control -->
      <input formControlName="firstName" class="form-control">
      
      <!-- Nested form group -->
      <div formGroupName="address">
        <input formControlName="street" class="form-control">
        <input formControlName="city" class="form-control">
      </div>
      
      <!-- Form array (dynamic) -->
      <div formArrayName="hobbies">
        @for (let hobby of (form.get('hobbies') as FormArray).controls; track $index) {
          <input [formControl]="hobby" class="form-control">
        }
      </div>
      <button type="button" (click)="addHobby()">Add Hobby</button>
      
      <!-- Error messages -->
      @if (form.get('email')?.invalid) {
        @if (form.get('email')?.errors?.['required']) {
          <p class="error">Email is required</p>
        }
        @if (form.get('email')?.errors?.['emailExists']) {
          <p class="error">Email already exists</p>
        }
      }
      
      <button type="submit" [disabled]="form.invalid">Save</button>
    </form>
  `
})
export class UserFormComponent {
  // ...
}
```

---

### 5.2 Custom Validators (Sync & Async)

```typescript
// SYNC VALIDATOR
export function minWordsValidator(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const words = control.value.trim().split(/\s+/).length;
    return words >= min ? null : { 'minWords': { min } };
  };
}

// Usage
const form = this.fb.group({
  description: ['', [Validators.required, minWordsValidator(5)]]
});

// ASYNC VALIDATOR (useful for server-side checks)
@Injectable({ providedIn: 'root' })
export class EmailUniquenessValidator {
  constructor(private http: HttpClient) {}
  
  validate(email: string): Observable<ValidationErrors | null> {
    return this.http.get<{ exists: boolean }>(`/api/check-email?email=${email}`).pipe(
      map(res => res.exists ? { 'emailExists': true } : null),
      catchError(() => of(null))
    );
  }
}

// AsyncValidatorFn
export function emailUniqueValidator(validator: EmailUniquenessValidator): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (!control.value) return of(null);
    
    return validator.validate(control.value).pipe(
      debounceTime(500), // Don't hit server too often
      first()
    );
  };
}

// Usage
const form = this.fb.group(
  {
    email: ['', Validators.required],
  },
  {
    asyncValidators: [emailUniqueValidator(emailValidator)],
    updateOn: 'blur' // Validate on blur, not on every keystroke
  }
);

// CROSS-FIELD VALIDATOR
export function passwordMatchValidator(group: FormGroup): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  
  return password === confirmPassword ? null : { 'passwordMismatch': true };
}

const form = this.fb.group(
  {
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required]
  },
  { validators: passwordMatchValidator }
);
```

---

### 5.3 Dynamic Forms

```typescript
// Real-world example: Build form from server config
interface FormConfig {
  fields: FieldConfig[];
}

interface FieldConfig {
  name: string;
  type: 'text' | 'email' | 'number' | 'select';
  label: string;
  required: boolean;
  options?: { label: string; value: any }[];
  validators?: { min?: number; max?: number; pattern?: string };
}

@Component({
  selector: 'app-dynamic-form',
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      @for (let field of config.fields; track field.name) {
        <div class="form-group">
          <label>{{ field.label }}</label>
          @switch (field.type) {
            @case ('text') {
              <input formControlName="{{ field.name }}" type="text" class="form-control">
            }
            @case ('email') {
              <input formControlName="{{ field.name }}" type="email" class="form-control">
            }
            @case ('select') {
              <select formControlName="{{ field.name }}" class="form-control">
                @for (let opt of field.options; track opt.value) {
                  <option [value]="opt.value">{{ opt.label }}</option>
                }
              </select>
            }
          }
          @if (form.get(field.name)?.errors) {
            <p class="error">{{ getErrorMessage(field.name) }}</p>
          }
        </div>
      }
      <button type="submit" [disabled]="form.invalid">Submit</button>
    </form>
  `
})
export class DynamicFormComponent implements OnInit {
  form!: FormGroup;
  config!: FormConfig;
  
  constructor(
    private fb: FormBuilder,
    private configService: ConfigService
  ) {}
  
  ngOnInit() {
    this.configService.getFormConfig().subscribe(config => {
      this.config = config;
      this.buildForm();
    });
  }
  
  buildForm() {
    const group: { [key: string]: any } = {};
    
    for (const field of this.config.fields) {
      const validators = [];
      if (field.required) validators.push(Validators.required);
      if (field.validators?.min !== undefined) validators.push(Validators.min(field.validators.min));
      if (field.validators?.pattern) validators.push(Validators.pattern(field.validators.pattern));
      
      group[field.name] = ['', validators];
    }
    
    this.form = this.fb.group(group);
  }
  
  submit() {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
  
  getErrorMessage(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (control?.errors?.['required']) return 'This field is required';
    if (control?.errors?.['min']) return 'Value is too small';
    return 'Invalid value';
  }
}
```

---

### 5.4 Form Performance Optimization

```typescript
// Problem: Too many form changes trigger too many change detections

@Component({
  selector: 'app-expensive-form',
  template: `
    <form [formGroup]="form">
      <input formControlName="search">
      <button (click)="search()">Search</button>
    </form>
    <div *ngFor="let result of results">{{ result }}</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush // Critical!
})
export class ExpensiveFormComponent {
  form!: FormGroup;
  results: string[] = [];
  
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      search: ['']
    });
  }
  
  search() {
    // ❌ Bad: Triggers change detection for every keystroke
    this.form.get('search')!.valueChanges.subscribe(term => {
      this.doSearch(term);
    });
    
    // ✅ Good: Debounce and use async pipe
    this.form.get('search')!.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap(term => this.searchService.search(term)),
        takeUntil(this.destroy$)
      )
      .subscribe(results => {
        this.results = results;
      });
  }
}

// BEST PRACTICE: Use OnPush + async pipe
@Component({
  selector: 'app-optimized-form',
  template: `
    <form [formGroup]="form">
      <input formControlName="search">
    </form>
    <div *ngFor="let result of results$ | async">{{ result }}</div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizedFormComponent {
  form!: FormGroup;
  results$: Observable<string[]>;
  
  constructor(private fb: FormBuilder, private searchService: SearchService) {
    this.form = this.fb.group({
      search: ['']
    });
    
    this.results$ = this.form.get('search')!.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(term => this.searchService.search(term)),
      startWith([])
    );
  }
}
```

---

---

## 6. HTTP, RxJS & Async Thinking

### 6.1 HttpClient Lifecycle & Interceptors

```typescript
// HTTP request lifecycle:
// 1. Create request → 2. Interceptors (request) → 3. HTTP call
// 4. Response arrives → 5. Interceptors (response) → 6. Subscribe to result

// COMMON PATTERNS:

// 1. Simple GET
this.http.get<User>('/api/users/1').subscribe(user => {
  console.log(user);
});

// 2. GET with params
this.http.get<User[]>('/api/users', {
  params: new HttpParams().set('page', '1').set('limit', '10')
}).subscribe(users => console.log(users));

// 3. GET with headers
this.http.get<User>('/api/users/1', {
  headers: new HttpHeaders().set('Authorization', 'Bearer token')
}).subscribe(user => console.log(user));

// 4. POST with body
this.http.post<User>('/api/users', { name: 'John', email: 'john@example.com' })
  .subscribe(user => console.log(user));

// 5. Error handling
this.http.get<User>('/api/users/1').pipe(
  catchError(error => {
    console.error('Error:', error);
    return of(null); // Fallback value
  })
).subscribe(user => console.log(user));

// 6. Retry logic
this.http.get<User>('/api/users/1').pipe(
  retry({
    count: 3,
    delay: 1000 // Wait 1s between retries
  }),
  timeout(5000) // Cancel after 5s
).subscribe(user => console.log(user));

// INTERCEPTORS: Global request/response handling
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add auth token to every request
    const token = this.authService.getToken();
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    
    return next.handle(authReq).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          console.log('Response:', event.status);
        }
      }),
      catchError(error => {
        if (error.status === 401) {
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
}

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Outgoing request to', req.url);
    
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          console.log('Response received from', req.url, 'Status:', event.status);
        }
      }),
      finalize(() => console.log('Request completed'))
    );
  }
}

// Register interceptors
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor, loggingInterceptor])
    )
  ]
});

// NEW: Functional interceptors (Angular 15+)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });
  
  return next(authReq);
};
```

---

### 6.2 RxJS Operators (Most Common)

```typescript
// TRANSFORMATION OPERATORS

// map: Transform each emission
of(1, 2, 3).pipe(
  map(x => x * 2)
).subscribe(x => console.log(x)); // 2, 4, 6

// switchMap: Switch to new observable (CANCEL previous)
// Use for: API calls where only latest request matters
searchInput$.pipe(
  switchMap(term => this.api.search(term)) // Cancel previous search
).subscribe(results => console.log(results));

// mergeMap: Merge all observables (DON'T CANCEL previous)
// Use for: Independent operations (like file uploads)
fileSelected$.pipe(
  mergeMap(file => this.api.upload(file)) // All uploads happen
).subscribe(result => console.log(result));

// concatMap: Queue operations (wait for previous to finish)
// Use for: Order matters (sequential API calls)
actions$.pipe(
  concatMap(action => this.api.execute(action)) // Wait for each to finish
).subscribe(result => console.log(result));

// exhaustMap: Ignore new while processing
// Use for: Prevent duplicate submissions
buttonClick$.pipe(
  exhaustMap(() => this.api.submit()) // Ignore clicks while submitting
).subscribe(result => console.log(result));

// FILTERING OPERATORS

// filter: Only emit if predicate is true
of(1, 2, 3, 4, 5).pipe(
  filter(x => x > 2)
).subscribe(x => console.log(x)); // 3, 4, 5

// distinctUntilChanged: Only emit if different from previous
of(1, 1, 2, 2, 3, 3).pipe(
  distinctUntilChanged()
).subscribe(x => console.log(x)); // 1, 2, 3

// take: Only take first N emissions
of(1, 2, 3, 4, 5).pipe(
  take(3)
).subscribe(x => console.log(x)); // 1, 2, 3

// debounceTime: Wait X ms before emitting
searchInput$.pipe(
  debounceTime(500) // Wait 500ms after each keystroke
).subscribe(term => console.log(term));

// throttleTime: Emit at most once per X ms
mouseMoveEvents$.pipe(
  throttleTime(100) // At most once per 100ms
).subscribe(pos => console.log(pos));

// COMBINATION OPERATORS

// combineLatest: Combine latest from multiple observables
combineLatest([
  userService.getUser(),
  settingsService.getSettings(),
  notificationService.getNotifications()
]).subscribe(([user, settings, notifications]) => {
  // All three have emitted at least once
});

// forkJoin: Wait for all observables to complete
forkJoin({
  users: this.http.get('/api/users'),
  posts: this.http.get('/api/posts'),
  comments: this.http.get('/api/comments')
}).subscribe(({ users, posts, comments }) => {
  // All requests done
});

// zip: Combine emissions one-to-one
zip(
  of(1, 2, 3),
  of('a', 'b', 'c'),
  of(true, false, true)
).subscribe(([num, letter, bool]) => {
  console.log(num, letter, bool);
});

// withLatestFrom: Combine with latest from another observable
actionClick$.pipe(
  withLatestFrom(currentUser$),
  switchMap(([action, user]) => this.api.executeAction(action, user))
).subscribe();

// ERROR HANDLING

// catchError: Handle errors
this.http.get('/api/data').pipe(
  catchError(error => {
    console.error('Error:', error);
    return of(defaultValue); // Fallback
  })
).subscribe();

// retry: Retry on error
this.http.get('/api/data').pipe(
  retry(3) // Retry 3 times
).subscribe();

// UTILITY OPERATORS

// tap: Side effects (logging, debugging)
of(1, 2, 3).pipe(
  tap(x => console.log('Processing:', x)),
  map(x => x * 2),
  tap(x => console.log('Result:', x))
).subscribe();

// shareReplay: Cache and share with multiple subscribers
const data$ = this.http.get('/api/data').pipe(
  shareReplay(1) // Cache 1 emission
);

data$.subscribe(); // Triggers HTTP call
data$.subscribe(); // Uses cached value
data$.subscribe(); // Uses cached value

// startWith: Emit initial value
of(1, 2, 3).pipe(
  startWith(0)
).subscribe(x => console.log(x)); // 0, 1, 2, 3

// finalize: Execute cleanup code
of(1, 2, 3).pipe(
  finalize(() => console.log('Completed!'))
).subscribe(x => console.log(x)); // 1, 2, 3, then "Completed!"
```

---

### 6.3 Subscription Management & Memory Leak Prevention

```typescript
// PROBLEM: Memory leaks from unmanaged subscriptions
@Component({
  selector: 'app-bad-subs',
  template: '<p>{{ data }}</p>'
})
export class BadSubscriptionsComponent implements OnInit {
  data: any;
  
  ngOnInit() {
    // ❌ MEMORY LEAK: Subscription never unsubscribed
    this.dataService.get().subscribe(data => {
      this.data = data;
    });
    
    // ❌ MEMORY LEAK: Multiple subscriptions
    this.userService.getUser().subscribe(user => console.log(user));
    this.postsService.getPosts().subscribe(posts => console.log(posts));
  }
}

// SOLUTION 1: Manual unsubscribe (tedious)
@Component({
  selector: 'app-manual-unsub'
})
export class ManualUnsubComponent implements OnInit, OnDestroy {
  data: any;
  private subscription: Subscription = new Subscription();
  
  ngOnInit() {
    this.subscription.add(
      this.dataService.get().subscribe(data => this.data = data)
    );
    this.subscription.add(
      this.userService.getUser().subscribe(user => console.log(user))
    );
  }
  
  ngOnDestroy() {
    this.subscription.unsubscribe(); // Unsubscribe all at once
  }
}

// SOLUTION 2: takeUntil pattern (recommended)
@Component({
  selector: 'app-takeuntil'
})
export class TakeUntilComponent implements OnInit, OnDestroy {
  data: any;
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    this.dataService.get()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => this.data = data);
    
    this.userService.getUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => console.log(user));
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// SOLUTION 3: async pipe (BEST for templates)
@Component({
  selector: 'app-async-pipe',
  template: '<p>{{ data$ | async }}</p>'
})
export class AsyncPipeComponent {
  data$ = this.dataService.get();
  
  constructor(private dataService: DataService) {}
  // Angular automatically unsubscribes when component destroys!
}

// SOLUTION 4: Signals + effect (Modern, 2025+)
@Component({
  selector: 'app-signals'
})
export class SignalsComponent implements OnInit {
  data = signal<any>(null);
  
  constructor(private dataService: DataService) {}
  
  ngOnInit() {
    effect(() => {
      firstValueFrom(this.dataService.get()).then(
        data => this.data.set(data)
      );
      // Effect automatically cleans up when component destroys
    });
  }
}

// SOLUTION 5: Scoped subscriptions
@Component({
  selector: 'app-scoped',
  template: `
    <div *ngIf="data$ | async as data">
      <p>{{ data }}</p>
    </div>
  `
})
export class ScopedComponent {
  data$ = this.dataService.get().pipe(
    shareReplay(1) // Share single subscription
  );
  
  constructor(private dataService: DataService) {}
}

// BEST PRACTICES:
// 1. Use async pipe by default
// 2. If manual subscription needed, use takeUntil
// 3. Never forget to unsubscribe
// 4. For Signals-based apps, use effect()
// 5. Test for memory leaks with Chrome DevTools
```

---

---

## 7. State Management (Practical)

### 7.1 Service-Based State (When RxJS is Enough)

```typescript
// For most apps, this is sufficient!
// No need for NgRx if your state is simple

@Injectable({ providedIn: 'root' })
export class UserService {
  private users$ = new BehaviorSubject<User[]>([]);
  private loading$ = new BehaviorSubject<boolean>(false);
  private error$ = new BehaviorSubject<string | null>(null);
  
  // Public read-only observables
  getUsers() {
    return this.users$.asObservable();
  }
  
  getLoading() {
    return this.loading$.asObservable();
  }
  
  getError() {
    return this.error$.asObservable();
  }
  
  // Actions
  loadUsers() {
    this.loading$.next(true);
    this.error$.next(null);
    
    this.http.get<User[]>('/api/users').subscribe({
      next: (users) => {
        this.users$.next(users);
        this.loading$.next(false);
      },
      error: (error) => {
        this.error$.next(error.message);
        this.loading$.next(false);
      }
    });
  }
  
  addUser(user: User) {
    this.http.post<User>('/api/users', user).subscribe({
      next: (newUser) => {
        const current = this.users$.value;
        this.users$.next([...current, newUser]);
      }
    });
  }
  
  deleteUser(id: string) {
    this.http.delete(`/api/users/${id}`).subscribe({
      next: () => {
        const current = this.users$.value;
        this.users$.next(current.filter(u => u.id !== id));
      }
    });
  }
}

// Usage in component
@Component({
  selector: 'app-user-list',
  template: `
    <div *ngIf="loading$ | async">Loading...</div>
    <div *ngIf="error$ | async as error">Error: {{ error }}</div>
    <ul>
      <li *ngFor="let user of users$ | async">
        {{ user.name }}
        <button (click)="deleteUser(user.id)">Delete</button>
      </li>
    </ul>
    <button (click)="addUser()">Add User</button>
  `
})
export class UserListComponent implements OnInit {
  users$: Observable<User[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  
  constructor(private userService: UserService) {
    this.users$ = this.userService.getUsers();
    this.loading$ = this.userService.getLoading();
    this.error$ = this.userService.getError();
  }
  
  ngOnInit() {
    this.userService.loadUsers();
  }
  
  deleteUser(id: string) {
    this.userService.deleteUser(id);
  }
  
  addUser() {
    this.userService.addUser({ id: '4', name: 'New User' });
  }
}

// WHEN TO USE THIS APPROACH:
// ✅ Small to medium apps
// ✅ Simple state (no complex relationships)
// ✅ Few components accessing shared state
// ✅ Team prefers simplicity
```

---

### 7.2 NgRx (When You Need It)

```typescript
// Use only when:
// - Large app with complex state
// - Multiple components need same data
// - Complex async operations
// - Time-travel debugging needed

// Step 1: Define state
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
}

// Step 2: Define actions
export const loadUsers = createAction('[Users Page] Load Users');
export const loadUsersSuccess = createAction(
  '[Users API] Load Users Success',
  props<{ users: User[] }>()
);
export const loadUsersError = createAction(
  '[Users API] Load Users Error',
  props<{ error: string }>()
);
export const addUser = createAction(
  '[Users Page] Add User',
  props<{ user: User }>()
);

// Step 3: Define reducer
export const usersReducer = createReducer(
  {
    users: [],
    loading: false,
    error: null
  } as UsersState,
  on(loadUsers, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(loadUsersSuccess, (state, { users }) => ({
    ...state,
    users,
    loading: false
  })),
  on(loadUsersError, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(addUser, (state, { user }) => ({
    ...state,
    users: [...state.users, user]
  }))
);

// Step 4: Define effects (handle side effects)
@Injectable()
export class UsersEffects {
  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUsers),
      switchMap(() =>
        this.http.get<User[]>('/api/users').pipe(
          map(users => loadUsersSuccess({ users })),
          catchError(error => of(loadUsersError({ error: error.message })))
        )
      )
    )
  );
  
  constructor(private actions$: Actions, private http: HttpClient) {}
}

// Step 5: Setup store
bootstrapApplication(AppComponent, {
  providers: [
    provideStore({
      users: usersReducer
    }),
    provideEffects([UsersEffects])
  ]
});

// Step 6: Use in component
@Component({
  selector: 'app-user-list',
  template: `
    <div *ngIf="loading$ | async">Loading...</div>
    <ul>
      <li *ngFor="let user of users$ | async">{{ user.name }}</li>
    </ul>
  `
})
export class UserListComponent {
  users$ = this.store.select(state => state.users.users);
  loading$ = this.store.select(state => state.users.loading);
  
  constructor(private store: Store) {}
  
  ngOnInit() {
    this.store.dispatch(loadUsers());
  }
}
```

---

### 7.3 When NOT to Use NgRx

```typescript
// ❌ DON'T use NgRx for:
// - Simple boolean flags (loading, modal open, etc.)
// - Local component state
// - Form state
// - Single-use data
// - Small apps

// ✅ DO use NgRx for:
// - Application-wide state
// - Complex domain logic
// - Multiple components need data
// - Async operations with retries/side effects
// - Debugging/time-travel required

// EXAMPLE: Over-engineered with NgRx
@Component({
  template: `<button (click)="toggleModal()">Open</button>`
})
export class ModalComponent {
  // ❌ OVERKILL: Using store for modal visibility
  isOpen$ = this.store.select(selectModalOpen);
  
  toggleModal() {
    this.store.dispatch(toggleModal());
  }
}

// BETTER: Simple service
@Injectable()
export class ModalService {
  private isOpen$ = new BehaviorSubject(false);
  
  toggle() {
    this.isOpen$.next(!this.isOpen$.value);
  }
  
  getState() {
    return this.isOpen$.asObservable();
  }
}

// Even better: Signals
@Injectable()
export class ModalSignalService {
  isOpen = signal(false);
  
  toggle() {
    this.isOpen.update(v => !v);
  }
}
```

---

### 7.4 Signals (Modern State Management, 2025+)

```typescript
// Signals are the future of Angular state management
// Simpler than RxJS, better performance

import { signal, computed, effect, watch } from '@angular/core';

// Simple signal
const count = signal(0);
count.set(1);
console.log(count()); // 1

// Computed signal (derived state)
const doubleCount = computed(() => count() * 2);
console.log(doubleCount()); // 2

// Effect (side effects)
effect(() => {
  console.log(`Count changed to: ${count()}`);
});

// Update signal
count.set(5);
count.update(v => v + 1);

// Real-world example: Store with Signals
@Injectable({ providedIn: 'root' })
export class TodoStore {
  private todos = signal<Todo[]>([]);
  private loading = signal(false);
  private error = signal<string | null>(null);
  
  // Public read-only
  todos$ = this.todos.asReadonly();
  loading$ = this.loading.asReadonly();
  error$ = this.error.asReadonly();
  
  // Computed
  completedCount = computed(() => {
    return this.todos().filter(t => t.completed).length;
  });
  
  pendingCount = computed(() => {
    return this.todos().length - this.completedCount();
  });
  
  // Methods
  addTodo(title: string) {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title,
      completed: false
    };
    this.todos.update(todos => [...todos, newTodo]);
  }
  
  toggleTodo(id: string) {
    this.todos.update(todos =>
      todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
  }
  
  loadTodos() {
    this.loading.set(true);
    this.error.set(null);
    
    this.http.get<Todo[]>('/api/todos').subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }
  
  constructor(private http: HttpClient) {}
}

// Usage in component
@Component({
  selector: 'app-todo-list',
  template: `
    @if (store.loading$()) {
      <p>Loading...</p>
    }
    
    <ul>
      @for (let todo of store.todos$(); track todo.id) {
        <li (click)="store.toggleTodo(todo.id)">
          {{ todo.title }}
          {{ todo.completed ? '✓' : '' }}
        </li>
      }
    </ul>
    
    <p>Completed: {{ store.completedCount() }}/{{ store.todos$().length }}</p>
  `
})
export class TodoListComponent implements OnInit {
  constructor(readonly store: TodoStore) {}
  
  ngOnInit() {
    this.store.loadTodos();
  }
}

// Benefits:
// ✅ No RxJS learning curve
// ✅ Fine-grained reactivity (only changed signals update)
// ✅ Better performance
// ✅ Synchronous (easier to debug)
// ✅ Smaller bundle size
```

---

---

## 8. Change Detection & Performance

### 8.1 Default vs OnPush Strategy

```typescript
// DEFAULT STRATEGY (ChangeDetectionStrategy.Default)
// Angular checks EVERY component EVERY time ANY change happens
// Slow in large apps!

@Component({
  selector: 'app-item',
  template: '<div>{{ item.name }} - {{ getCurrentTime() }}</div>',
  // changeDetection: ChangeDetectionStrategy.Default (default)
})
export class ItemComponent {
  @Input() item!: Item;
  
  getCurrentTime() {
    return new Date().toLocaleTimeString();
  }
}

// When ANY event fires (click, API response, etc.):
// 1. Angular checks AppComponent
// 2. Angular checks HeaderComponent
// 3. Angular checks ItemComponent (even if input unchanged!)
// 4. Repeat for every component
// = SLOW!

// ONPUSH STRATEGY (Recommended)
// Angular only checks component if:
// 1. @Input changed (reference), OR
// 2. Event fired in component template, OR
// 3. Observable emitted with async pipe, OR
// 4. Signal changed

@Component({
  selector: 'app-optimized-item',
  template: '<div>{{ item.name }}</div>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OptimizedItemComponent {
  @Input() item!: Item; // Only updates if reference changes
}

// When @Input reference changes:
// 1. Angular checks AppComponent
// 2. Angular checks ItemComponent (reference changed!)
// 3. Skips other components (no event in template)
// = FAST!

// KEY: With OnPush, pass new reference, not mutation
@Component({
  template: `<app-item [item]="item"></app-item>`
})
export class ParentComponent {
  item: Item = { name: 'Item 1' };
  
  updateItem() {
    // ❌ WRONG: Mutation, OnPush won't detect
    this.item.name = 'Updated';
    
    // ✅ CORRECT: New reference, OnPush detects
    this.item = { ...this.item, name: 'Updated' };
  }
}

// Real impact:
// Default: 50-100ms change detection per cycle
// OnPush: 5-10ms change detection per cycle
// = 10x FASTER!

// BEST PRACTICE: Use OnPush everywhere
// It forces immutability which makes code safer
```

---

### 8.2 How Change Detection Actually Runs

```typescript
// Angular's change detection cycle:
// 1. Zone.js detects async event (click, timeout, API response)
// 2. Angular runs change detection from root component
// 3. For each component:
//    a. Update @Input properties
//    b. Run ngOnInit, ngOnChanges if first time
//    c. Update component properties
//    d. Re-evaluate template expressions
//    e. Update DOM if changed
// 4. Check child components (recursively)
// 5. Run ngAfterViewInit if first time
// 6. Run ngAfterContentInit if first time

// NgZone: Control when change detection runs
@Component({
  selector: 'app-performance',
  template: '<button (click)="onClick()">Click {{ count }}</button>'
})
export class PerformanceComponent {
  count = 0;
  
  constructor(private ngZone: NgZone) {}
  
  onClick() {
    this.count++; // Triggers change detection
  }
  
  // Run outside Angular zone (no change detection)
  runHeavyOperation() {
    this.ngZone.runOutsideAngular(() => {
      // This doesn't trigger change detection
      setInterval(() => {
        console.log('Heavy logging');
      }, 1000);
    });
  }
  
  // Back into Angular zone (triggers change detection)
  updateUI() {
    this.ngZone.run(() => {
      this.count++;
    });
  }
}

// Zone.js overhead: ~30KB bundle size, ~40% performance cost
// FUTURE: Zoneless change detection (Angular 20+)
// Signals + OnPush automatically implement zoneless benefits
```

---

### 8.3 TrackBy in *ngFor (Critical for Lists)

```typescript
// ❌ WITHOUT trackBy: Angular recreates every item every change detection
@Component({
  template: `
    <div *ngFor="let item of items">
      {{ item.id }}: {{ item.name }}
      <input type="text"> <!-- Loses focus on every CD cycle! -->
    </div>
  `
})
export class BadListComponent {
  items = [{ id: 1, name: 'Item 1' }];
}

// With 1000 items, every change detection = recreate 1000 DOM nodes!

// ✅ WITH trackBy: Angular reuses DOM nodes, only updates changed items
@Component({
  template: `
    @for (let item of items; track item.id) {
      {{ item.id }}: {{ item.name }}
      <input type="text"> <!-- Maintains focus! -->
    }
    
    <!-- Old syntax: *ngFor="let item of items; trackBy: trackByFn" -->
  `
})
export class GoodListComponent {
  items = [{ id: 1, name: 'Item 1' }];
  
  // Only needed with *ngFor, not @for (trackBy is native)
  trackByFn(index: number, item: Item) {
    return item.id; // Unique identifier
  }
}

// Without trackBy with 1000 items:
// Change detection = 1000 DOM recreations = 500ms

// With trackBy with 1000 items:
// Change detection = Only update changed items = 50ms
// = 10x FASTER!

// ALWAYS use trackBy or @for with track
```

---

### 8.4 Virtual Scrolling for Lists

```typescript
// Problem: 10,000 items = render 10,000 DOM nodes = VERY SLOW

// Solution: Virtual scrolling (only render visible items)
@Component({
  selector: 'app-virtual-list',
  template: `
    <cdk-virtual-scroll-viewport itemSize="50" class="list-container">
      @for (let item of items; track item.id) {
        <div class="list-item">{{ item.name }}</div>
      }
    </cdk-virtual-scroll-viewport>
  `,
  styles: ['.list-container { height: 500px; }']
})
export class VirtualListComponent {
  items = Array.from({ length: 100000 }, (_, i) => ({
    id: i,
    name: `Item ${i}`
  }));
}

// With virtual scrolling:
// - Only 10-15 visible items rendered
// - 99,985 items are not in DOM
// - Smooth scrolling with 100k items!

// Without virtual scrolling:
// - All 100,000 items in DOM
// - Cannot scroll smoothly
// - Browser crashes

// Import CDK
import { ScrollingModule } from '@angular/cdk/scrolling';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    // ...
  ]
});
```

---

### 8.5 Async Pipe Benefits

```typescript
// Why async pipe is AMAZING for performance

// ❌ MANUAL SUBSCRIPTION (anti-pattern)
@Component({
  template: '<p>{{ message }}</p>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadComponent {
  message: string = '';
  
  constructor(private data$: Observable<string>) {}
  
  ngOnInit() {
    this.data$.subscribe(msg => {
      this.message = msg;
      // ⚠️ This doesn't trigger change detection with OnPush!
      // Need ChangeDetectorRef.markForCheck()
    });
  }
}

// ✅ ASYNC PIPE (best pattern)
@Component({
  template: '<p>{{ data$ | async }}</p>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoodComponent {
  data$ = this.dataService.get$();
  
  constructor(private dataService: DataService) {}
  // Angular automatically handles subscription/unsubscription!
  // Automatic change detection with OnPush!
}

// Benefits of async pipe:
// 1. Automatic subscription management
// 2. Automatic unsubscription (no memory leaks)
// 3. Works perfectly with OnPush
// 4. Readable code
// 5. Single subscription (shareReplay if multiple pipes)

// If you must subscribe manually:
@Component({
  template: '<p>{{ message }}</p>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManualComponent {
  message: string = '';
  
  constructor(
    private data$: Observable<string>,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    this.data$.subscribe(msg => {
      this.message = msg;
      this.cdr.markForCheck(); // Manual change detection
    });
  }
}
```

---

---

## 9. Modern Angular Features (15+)

### 9.1 Standalone Components & APIs

```typescript
// NO NgModule required with standalone
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet], // Direct imports
  template: `
    <h1>{{ title }}</h1>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  title = 'My App';
}

// Bootstrap without AppModule
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideLocationMocks() // For testing
  ]
});

// Lazy load standalone components
const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
    providers: [AdminService] // Component-level providers
  }
];

// Benefits:
// ✅ No NgModule boilerplate
// ✅ Tree-shakable (only import what you use)
// ✅ Easier to understand (everything at component level)
// ✅ Simpler lazy loading
```

---

### 9.2 Signals & Fine-Grained Reactivity

```typescript
import { signal, computed, effect, linkedSignal, untracked } from '@angular/core';

// Writable signal
const count = signal(0);
count.set(1);
count.update(v => v + 1);

// Read-only signal (from parent)
const readonlyCount = count.asReadonly();

// Computed signal (derived state, like memo)
const doubled = computed(() => count() * 2);
const squared = computed(() => count() * count());

// Linked signal (watch another signal and transform)
const doubledLinked = linkedSignal({
  source: count,
  computation: (value) => value * 2
});

// Effect (run when dependencies change)
effect(() => {
  console.log(`Count is: ${count()}`);
  console.log(`Doubled is: ${doubled()}`);
});

// Effect with side effects
const userSignal = signal<User | null>(null);
effect(() => {
  const user = userSignal();
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
});

// Untracked (read signal without creating dependency)
effect(() => {
  console.log(`Count: ${count()}`);
  console.log(`Name: ${untracked(() => userSignal()?.name)}`);
  // Only re-run when count changes, not user
});

// Resource (for async data)
const userResource = resource({
  request: () => userId(),
  loader: ({ request }) =>
    firstValueFrom(this.http.get(`/api/users/${request}`))
});

@Component({
  selector: 'app-reactive',
  template: `
    <p>Count: {{ count() }}</p>
    <p>Doubled: {{ doubled() }}</p>
    <button (click)="increment()">Increment</button>
    
    @if (userResource.isLoading()) {
      <p>Loading user...</p>
    }
    @if (userResource.value(); as user) {
      <h1>{{ user.name }}</h1>
    }
  `
})
export class ReactiveComponent {
  readonly count = signal(0);
  readonly doubled = computed(() => this.count() * 2);
  
  userResource = resource({
    request: () => userId(),
    loader: async ({ request }) => {
      const res = await fetch(`/api/users/${request}`);
      return res.json();
    }
  });
  
  userId = signal('1');
  
  increment() {
    this.count.update(c => c + 1);
  }
}

// Benefits of signals:
// ✅ Fine-grained reactivity (only affected components update)
// ✅ Synchronous (easier debugging)
// ✅ No RxJS learning curve
// ✅ Better performance than Observables in templates
// ✅ TypeScript-friendly
```

---

### 9.3 New Control Flow (@if, @for, @switch, @defer)

```typescript
// NEW SYNTAX (Angular 17+)

@Component({
  template: `
    <!-- @if / @else -->
    @if (isLoggedIn()) {
      <h1>Welcome {{ userName() }}</h1>
    } @else if (isLoading()) {
      <p>Loading...</p>
    } @else {
      <button (click)="login()">Login</button>
    }
    
    <!-- @for with track (much better than *ngFor) -->
    @for (let item of items(); track item.id) {
      <div>{{ item.name }}</div>
      @if (item.selected) {
        <span class="checked">✓</span>
      }
    } @empty {
      <p>No items found</p>
    }
    
    <!-- @switch / @case (cleaner than ngSwitch) -->
    @switch (status()) {
      @case ('loading') {
        <p>Loading...</p>
      }
      @case ('success') {
        <p>Success!</p>
      }
      @case ('error') {
        <p>Error: {{ error() }}</p>
      }
      @default {
        <p>Unknown status</p>
      }
    }
  `
})
export class ControlFlowComponent {
  isLoggedIn = signal(false);
  userName = signal('John');
  isLoading = signal(false);
  status = signal<'loading' | 'success' | 'error'>('loading');
  error = signal('');
  items = signal([
    { id: 1, name: 'Item 1', selected: true },
    { id: 2, name: 'Item 2', selected: false }
  ]);
  
  login() { /* ... */ }
}

// Benefits:
// ✅ Clearer syntax
// ✅ Better type safety
// ✅ Easier to read
// ✅ Native to Angular (not directives)
// ✅ Better performance (native to compiler)
```

---

### 9.4 @defer: Lazy Load Views

```typescript
// Defer non-critical content to improve initial load

@Component({
  selector: 'app-dashboard',
  template: `
    <!-- Critical content (load immediately) -->
    <header>Dashboard</header>
    <main-content></main-content>
    
    <!-- Non-critical content (load later) -->
    @defer (on viewport) {
      <analytics-dashboard></analytics-dashboard>
    } @placeholder {
      <div class="placeholder">Analytics dashboard loading...</div>
    } @loading (minimum 1s) {
      <div class="skeleton">Loading...</div>
    } @error {
      <p>Failed to load analytics</p>
    }
    
    <!-- Defer multiple conditions -->
    @defer (on interaction) {
      <advanced-settings></advanced-settings>
    } @placeholder {
      <button>Click to load settings</button>
    }
    
    <!-- Defer with idle (wait for browser idle) -->
    @defer (on idle) {
      <recommendations></recommendations>
    }
  `
})
export class DashboardComponent {}

// Triggers:
// - on viewport: Load when visible in viewport
// - on interaction: Load when user interacts (click, hover, focus)
// - on timer(Ms): Load after X milliseconds
// - on idle: Load when browser is idle
// - on immediate: Load immediately (for testing)

// Blocks:
// @placeholder: Show while loading
// @loading: Show during loading (with minimum time)
// @error: Show if fails to load

// Real impact:
// Initial bundle: Without defer = 500KB, With defer = 200KB
// Initial load: 2s → 500ms (4x faster!)
```

---

### 9.5 Input/Output in Standalone

```typescript
// Standalone components use same @Input/@Output
// But you import them directly

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="card">
      <h2>{{ title }}</h2>
      <p>{{ content }}</p>
      <button (click)="onAction()">{{ actionLabel }}</button>
    </div>
  `
})
export class CardComponent {
  @Input() title!: string;
  @Input() content!: string;
  @Input() actionLabel = 'Click me';
  @Output() action = new EventEmitter<void>();
  
  onAction() {
    this.action.emit();
  }
}

// Parent
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardComponent], // Direct import
  template: `
    <app-card
      title="My Card"
      content="Card content"
      actionLabel="Save"
      (action)="handleAction()">
    </app-card>
  `
})
export class DashboardComponent {
  handleAction() { /* ... */ }
}

// Two-way binding (still available)
@Component({
  selector: 'app-input',
  standalone: true,
  template: `<input [(ngModel)]="value">`
})
export class InputComponent {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
  
  // Equivalent to: [value]="value" (valueChange)="value = $event"
}
```

---

---

## 10. Testing

### 10.1 Component Testing with TestBed

```typescript
// Setup
import { ComponentFixture, TestBed } from '@angular/core/testing';

@Component({
  selector: 'app-counter',
  template: `
    <p>{{ count }}</p>
    <button (click)="increment()">Increment</button>
  `
})
export class CounterComponent {
  count = 0;
  
  increment() {
    this.count++;
  }
}

// Test
describe('CounterComponent', () => {
  let component: CounterComponent;
  let fixture: ComponentFixture<CounterComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CounterComponent],
      // imports: [CommonModule], // If standalone
      // providers: [SomeService]
    }).compileComponents();
    
    fixture = TestBed.createComponent(CounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger first CD cycle
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should increment count', () => {
    expect(component.count).toBe(0);
    component.increment();
    expect(component.count).toBe(1);
  });
  
  it('should display count in template', () => {
    component.count = 5;
    fixture.detectChanges(); // Update template
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('p').textContent).toContain('5');
  });
  
  it('should increment on button click', () => {
    const button = fixture.debugElement.query(
      (el) => el.nativeElement.tagName === 'BUTTON'
    );
    
    button.nativeElement.click();
    fixture.detectChanges();
    
    expect(component.count).toBe(1);
  });
});

// Service testing with mocks
@Injectable()
export class UserService {
  constructor(private http: HttpClient) {}
  
  getUser(id: string): Observable<User> {
    return this.http.get(`/api/users/${id}`);
  }
}

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, HttpClientTestingModule]
    });
    
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  afterEach(() => {
    httpMock.verify(); // Verify no outstanding requests
  });
  
  it('should fetch user', () => {
    const mockUser = { id: '1', name: 'John' };
    
    service.getUser('1').subscribe(user => {
      expect(user).toEqual(mockUser);
    });
    
    // Intercept HTTP call
    const req = httpMock.expectOne('/api/users/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser); // Respond with mock data
  });
});
```

---

### 10.2 Testing Async Code

```typescript
// Async testing
it('should load user asynchronously', async () => {
  const user$ = of({ id: '1', name: 'John' }).pipe(delay(100));
  
  let result: User | undefined;
  user$.subscribe(user => {
    result = user;
  });
  
  await new Promise(resolve => setTimeout(resolve, 150));
  expect(result).toEqual({ id: '1', name: 'John' });
});

// fakeAsync (control time)
it('should load user with fakeAsync', fakeAsync(() => {
  const user$ = of({ id: '1', name: 'John' }).pipe(delay(100));
  
  let result: User | undefined;
  user$.subscribe(user => {
    result = user;
  });
  
  tick(100); // Advance time 100ms
  
  expect(result).toEqual({ id: '1', name: 'John' });
}));

// Testing Promises
it('should handle promises', async () => {
  const promise = Promise.resolve({ id: '1' });
  const result = await promise;
  expect(result.id).toBe('1');
});
```

---

### 10.3 E2E Testing (Cypress/Playwright)

```typescript
// Cypress example
describe('User List Page', () => {
  beforeEach(() => {
    cy.visit('/users');
  });
  
  it('should load and display users', () => {
    cy.get('[data-test="user-list"]').should('be.visible');
    cy.get('[data-test="user-item"]').should('have.length.greaterThan', 0);
  });
  
  it('should add new user', () => {
    cy.get('[data-test="add-user-btn"]').click();
    cy.get('input[name="name"]').type('John Doe');
    cy.get('input[name="email"]').type('john@example.com');
    cy.get('[data-test="save-btn"]').click();
    
    cy.get('[data-test="user-item"]').contains('John Doe').should('be.visible');
  });
  
  it('should delete user', () => {
    cy.get('[data-test="delete-btn"]').first().click();
    cy.get('[data-test="confirm-btn"]').click();
    
    cy.get('[data-test="toast"]').contains('User deleted').should('be.visible');
  });
});
```

---

---

## 11. Build, Deploy & Environments

### 11.1 Angular Build Process

```bash
# Development build (fast, large)
ng build

# Production build (optimized, small)
ng build --configuration production

# What production build does:
# 1. Minification: Remove whitespace/comments
# 2. Tree-shaking: Remove unused code
# 3. Ahead-of-Time (AOT) compilation: Pre-compile templates
# 4. Bundle analysis: See what's in your bundle
# 5. Differential loading: Serve modern JS to modern browsers

# View bundle size
ng build --stats-json
webpack-bundle-analyzer dist/my-app/stats.json

# Results:
# Development: 2MB, load time 5s
# Production: 150KB, load time 500ms
# = 13x faster!
```

---

### 11.2 Environments & Configuration

```typescript
// environment.ts (development)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  enableDebug: true
};

// environment.prod.ts (production)
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com',
  enableDebug: false
};

// Usage in service
@Injectable()
export class ApiService {
  constructor(private http: HttpClient) {}
  
  getUsers(): Observable<User[]> {
    const url = `${environment.apiUrl}/users`;
    return this.http.get<User[]>(url);
  }
}

// angular.json configuration
{
  "projects": {
    "my-app": {
      "configurations": {
        "production": {
          "outputHashing": "all",
          "optimization": true,
          "sourceMap": false,
          "namedChunks": false,
          "aot": true,
          "extractLicenses": true,
          "vendorChunk": false
        },
        "development": {
          "optimization": false,
          "sourceMap": true,
          "extractLicenses": false
        }
      }
    }
  }
}
```

---

### 11.3 Lazy Loading & Code Splitting

```typescript
// Automatic code splitting with lazy loading
const routes: Routes = [
  { path: '', component: HomeComponent }, // In main bundle
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
    // In separate chunk, loaded on demand
  },
  {
    path: 'users/:id',
    loadComponent: () => import('./user-detail/user-detail.component').then(m => m.UserDetailComponent)
    // In separate chunk
  }
];

// Results:
// main.js: 50KB (core + home)
// admin.chunk.js: 40KB (admin features)
// user-detail.chunk.js: 30KB (user details)
// Total: 120KB instead of 200KB in one file
// = Faster initial load + faster admin/user pages
```

---

### 11.4 Hosting Options

```
// Vercel (Recommended for Angular)
npm install -g vercel
vercel

// Netlify
npm run build
netlify deploy --prod --dir=dist

// AWS S3 + CloudFront
aws s3 sync dist/ s3://my-bucket/
# Enable CloudFront for CDN

// Docker + Cloud Run
docker build -t my-app .
gcloud run deploy my-app --image my-app

// Traditional (Nginx)
server {
  listen 80;
  location / {
    root /var/www/angular-app/dist;
    try_files $uri $uri/ /index.html; # SPA routing
  }
}
```

---

---

## 12. Security & Best Practices

### 12.1 XSS & Angular Sanitization

```typescript
// Angular automatically sanitizes HTML by default
@Component({
  template: '<h1>{{ userInput }}</h1>' // Safe: text only
})
export class SafeComponent {
  userInput = '<script>alert("XSS")</script>';
  // Renders as text, not executed!
}

// If you MUST render HTML
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  template: '<div [innerHTML]="safeHtml"></div>'
})
export class UnsafeComponent {
  safeHtml: SafeHtml;
  
  constructor(private sanitizer: DomSanitizer) {
    // Only use if you TRUST the source
    this.safeHtml = this.sanitizer.sanitize(SecurityContext.HTML, userHtml);
  }
}

// Use SafeHtml for trusted sources
this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(trustedHtml);

// Never use DOM APIs directly
// ❌ WRONG
element.innerHTML = userInput;

// ✅ RIGHT
const div = document.createElement('div');
div.textContent = userInput;
```

---

### 12.2 CSRF, CORS, Auth Tokens

```typescript
// CSRF Protection: Angular auto-adds token to X-XSRF-TOKEN header
// Server validates token on state-changing requests

// CORS: Configure backend to allow your domain
// Backend response: Access-Control-Allow-Origin: https://myapp.com

// Auth interceptor (add token to every request)
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    if (token) {
      req = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }
    
    return next.handle(req).pipe(
      catchError(error => {
        if (error.status === 401) {
          // Token expired, logout
          this.authService.logout();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}

// Store tokens securely
// ✅ Best: HTTP-only cookie (not accessible to JS)
// ✓ Good: SessionStorage (cleared on tab close)
// ❌ Bad: localStorage (survives browser restart, XSS target)
```

---

### 12.3 Content Security Policy

```html
<!-- In index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.example.com;
  font-src 'self' https://fonts.googleapis.com;
">
```

---

---

## 13. System Design (Frontend)

### 13.1 Folder Structure for Large Apps

```
src/
├── app/
│   ├── core/                    # Singleton services
│   │   ├── auth/
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.guard.ts
│   │   │   └── auth.interceptor.ts
│   │   ├── http/
│   │   │   ├── api.service.ts
│   │   │   └── error.interceptor.ts
│   │   └── services/            # Other singleton services
│   │
│   ├── shared/                  # Shared components, pipes, directives
│   │   ├── components/
│   │   │   ├── button/
│   │   │   ├── modal/
│   │   │   └── loading/
│   │   ├── pipes/
│   │   │   ├── safe-html.pipe.ts
│   │   │   └── format-date.pipe.ts
│   │   ├── directives/
│   │   └── shared.module.ts
│   │
│   ├── features/                # Feature modules
│   │   ├── users/
│   │   │   ├── pages/
│   │   │   │   ├── user-list/
│   │   │   │   │   ├── user-list.component.ts
│   │   │   │   │   ├── user-list.component.html
│   │   │   │   │   └── user-list.component.scss
│   │   │   │   └── user-detail/
│   │   │   ├── components/
│   │   │   │   └── user-card/
│   │   │   ├── services/
│   │   │   │   └── user.service.ts
│   │   │   ├── store/           # NgRx or Signals-based state
│   │   │   │   ├── user.actions.ts
│   │   │   │   ├── user.reducer.ts
│   │   │   │   └── user.effects.ts
│   │   │   └── users.routes.ts
│   │   │
│   │   ├── dashboard/
│   │   ├── admin/
│   │   └── settings/
│   │
│   ├── app-routing.module.ts    # Main router config
│   └── app.component.ts
│
├── assets/                      # Images, fonts, static files
├── styles/                      # Global styles
└── environments/                # Environment configs
```

---

### 13.2 Feature-Based Architecture

```typescript
// Each feature is independent, lazy-loadable

// users/users.routes.ts
export const USERS_ROUTES: Routes = [
  {
    path: '',
    component: UserListComponent
  },
  {
    path: ':id',
    component: UserDetailComponent
  },
  {
    path: ':id/edit',
    component: UserEditComponent
  }
];

// app-routing.module.ts
export const APP_ROUTES: Routes = [
  {
    path: 'users',
    loadChildren: () => import('./features/users/users.routes').then(m => m.USERS_ROUTES),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [adminGuard]
  }
];

// Benefits:
// - Each feature is isolated
// - Can be developed independently
// - Easy to scale to multiple teams
// - Clear dependencies
// - Easy to lazy load
```

---

### 13.3 Reusable UI Component Library

```typescript
// Create a library of reusable components
// Angular schematic: ng generate library shared-ui

// shared-ui/src/lib/button/button.component.ts
@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button 
      [class]="'btn btn-' + variant"
      [disabled]="disabled"
      (click)="onClick()">
      {{ label }}
    </button>
  `,
  styles: [`
    .btn { padding: 8px 16px; border-radius: 4px; }
    .btn-primary { background: blue; color: white; }
    .btn-secondary { background: gray; color: white; }
  `]
})
export class ButtonComponent {
  @Input() label = 'Click me';
  @Input() variant: 'primary' | 'secondary' = 'primary';
  @Input() disabled = false;
  @Output() click = new EventEmitter<void>();
  
  onClick() {
    this.click.emit();
  }
}

// Usage in main app
import { ButtonComponent } from '@my-org/shared-ui';

@Component({
  imports: [ButtonComponent],
  template: `
    <app-button 
      label="Save"
      variant="primary"
      (click)="save()">
    </app-button>
  `
})
export class MyComponent {}

// Publish library to npm, use across multiple apps!
```

---

### 13.4 Monorepo with Nx

```bash
# Create monorepo
npx create-nx-workspace@latest my-workspace

# Add apps
nx generate @nx/angular:application my-app

# Add shared lib
nx generate @nx/angular:library shared-ui

# Build only affected
nx run-many --target=build --all --skip-nx-cache

# Benefits:
# - Multiple apps, one repo
# - Shared libraries
# - Dependency analysis
# - Incremental builds
# - Enforce architecture
```

---

---

## 14. 2026 Updates & Emerging Tech

### 14.1 Angular 20+ (2025-2026)

```typescript
// ZONELESS CHANGE DETECTION
// Angular 20 introduces zoneless architecture
// Eliminates Zone.js overhead (~30KB, 40% performance)

// Enable in bootstrap
bootstrapApplication(AppComponent, {
  providers: [
    // Zoneless (new in Angular 20)
    // provideZoneChangeDetection({ eventCoalescing: false })
    
    // Old way (with Zone.js)
    // provideZoneChangeDetection({ eventCoalescing: true })
  ]
});

// With zoneless + Signals:
// - 40-60% faster startup
// - 50-70% less change detection overhead
// - Signals become THE reactive primitive
// - OnPush is implicit

// HYDRATION IMPROVEMENTS (Server-Side Rendering)
// Faster first contentful paint (FCP)
// Better Core Web Vitals
bootstrapApplication(AppComponent, {
  providers: [provideClientHydration()]
});

// DYNAMIC COMPONENT CREATION (Type-safe)
@Component({
  template: `<ng-container #container></ng-container>`
})
export class DynamicComponent {
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;
  
  loadComponent(componentClass: Type<any>) {
    // New way (type-safe)
    const ref = this.container.createComponent(componentClass);
    
    // Old way (deprecated)
    // const factory = this.componentFactoryResolver.resolveComponentFactory(componentClass);
    // this.container.createComponent(factory);
  }
}

// HTTP RESOURCE (NEW!)
import { resource } from '@angular/core';

export class UserDetailComponent {
  userId = signal('1');
  
  user = resource({
    request: () => ({ id: this.userId() }),
    loader: ({ request }) =>
      this.http.get(`/api/users/${request.id}`)
  });
  
  constructor(private http: HttpClient) {}
}

// TEMPLATE SYNTAX ENHANCEMENTS
// Support for:
// - Exponential operator: 2 ** 3
// - Optional chaining in templates: user?.name
// - Nullish coalescing: value ?? 'default'
// - Tagged template literals
@Component({
  template: `
    <p>{{ user?.name ?? 'Anonymous' }}</p>
    <p>{{ 2 ** 10 }}</p>
  `
})
export class TemplateComponent {
  user: { name: string } | null = { name: 'John' };
}
```

---

### 14.2 Performance Benchmarks (2026 Reality)

```typescript
// Typical Angular app improvements:

// Initial Load Time
// Before optimization: 5s (with DevTools)
// After zoneless + lazy loading + signals: 1.2s
// = 4.2x faster!

// Runtime Performance
// Default change detection: 50-100ms per cycle
// OnPush strategy: 5-10ms per cycle
// Signals-based: 2-5ms per cycle
// = 10-50x faster!

// Bundle Size
// No optimizations: 500KB
// Production build: 150KB
// With lazy loading: 50KB initial + chunks
// With tree-shaking: 30KB initial
// = 16x smaller!

// Memory Usage
// Large list (10k items):
// Virtual scrolling off: 2GB (browser crash)
// Virtual scrolling on: 50MB
// = 40x less memory!
```

---

### 14.3 Future: Signals + Zoneless (The New Standard)

```typescript
// By 2026, this will be THE way to build Angular
// Signals + OnPush + Zoneless = The Golden Standard

import { signal, computed, effect } from '@angular/core';

@Component({
  selector: 'app-future',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>{{ title() }}</h1>
    <p>Count: {{ count() }}</p>
    <p>Doubled: {{ doubled() }}</p>
    <button (click)="increment()">Increment</button>
    
    @for (let user of users(); track user.id) {
      <div>{{ user.name }}</div>
    }
  `
})
export class FutureComponent {
  title = signal('My App');
  count = signal(0);
  
  // Computed is like useMemo in React
  doubled = computed(() => this.count() * 2);
  
  users = resource({
    request: () => ({}),
    loader: () => this.http.get('/api/users')
  });
  
  constructor(private http: HttpClient) {}
  
  increment() {
    this.count.update(c => c + 1);
  }
}

// Benefits:
// ✅ No subscriptions needed
// ✅ Synchronous (easy debugging)
// ✅ Fine-grained reactivity
// ✅ Small bundle size
// ✅ Fast performance
// ✅ Easy to learn (like React hooks)
```

---

---

## 15. Real Interview Projects

### Project 1: Dashboard App

**Requirements:**
- Auth (login, logout, protected routes)
- User API integration (GET, POST, DELETE)
- State management (Signals or NgRx)
- Charts/Analytics
- Responsive design
- Search/filter functionality
- Performance optimized (OnPush, lazy loading, virtual scrolling for large lists)

**Key Topics to Demonstrate:**
1. **Authentication:** Auth guards, interceptors, token refresh
2. **Forms:** Reactive forms with validation
3. **HTTP:** Error handling, retries, timeouts
4. **State:** Service + Signals vs NgRx trade-off
5. **Performance:** OnPush, trackBy, async pipe
6. **UI:** Responsive, accessible, clean design

**Interview Questions They'll Ask:**
- "How would you implement token refresh?"
- "How would you cache API responses?"
- "How would you handle 10k users in a list?"
- "What's your state management strategy?"

---

### Project 2: E-Commerce Product Listing

**Requirements:**
- Product list with pagination/infinite scroll
- Filters (category, price, rating)
- Search functionality
- Shopping cart (Add, remove, update)
- Checkout flow (multi-step form)
- Order tracking
- Mobile responsive
- Dark mode toggle

**Key Topics:**
1. **Advanced Forms:** Dynamic forms, custom validators, cross-field validation
2. **RxJS:** combineLatest, switchMap, debounce for filters
3. **State:** Cart state management
4. **Performance:** Virtual scrolling, OnPush, lazy chunk loading
5. **Routing:** Multi-step checkout with guards
6. **UX:** Loading states, error handling, optimistic updates

**Interview Gold:**
- "How would you debounce filters without re-fetching unnecessary data?"
- "How would you implement optimistic cart updates?"
- "How would you prevent data loss on page refresh?"

---

### Project 3: Real-Time Collaboration Tool

**Requirements:**
- WebSocket integration (real-time updates)
- Multi-user editing
- Conflict resolution
- Undo/redo
- Presence indicators
- Comments/annotations
- History/version control

**Key Topics:**
1. **RxJS Advanced:** Subject, ReplaySubject, higher-order observables
2. **Concurrency:** mergeMap, concatMap, switchMap decisions
3. **State:** Complex state management (history, presence, conflict resolution)
4. **Performance:** Incremental updates, delta sync, compression
5. **Memory:** Subscription management, memory leak prevention

**Interview Gold:**
- "How would you handle conflict resolution when two users edit same field?"
- "How would you implement undo/redo efficiently?"
- "How would you prevent memory leaks with WebSocket?"
- "How would you sync state across multiple tabs?"

---

---

## 16. Interview Prep Strategy

### 16.1 The 4-Week Preparation Plan

**Week 1: Foundation (Concepts)**
- [ ] Deep dive: Execution context, closures, event loop
- [ ] TypeScript: Types, interfaces, generics, utility types
- [ ] Angular basics: Components, templates, binding types
- [ ] DI: Providers, injectors, tokens

**Week 2: Core Features**
- [ ] Routing: Lazy loading, guards, resolvers
- [ ] Forms: Reactive forms, validators, custom validators
- [ ] HTTP: HttpClient, interceptors, error handling
- [ ] RxJS: map, switchMap, mergeMap, filter, catchError, retry

**Week 3: Advanced Topics**
- [ ] Change detection: Default vs OnPush, Zone.js
- [ ] State management: Service + Signals vs NgRx
- [ ] Performance: TrackBy, async pipe, virtual scrolling
- [ ] Modern Angular: Standalone, Signals, @defer, @if, @for

**Week 4: Practice & System Design**
- [ ] Build one small project (dashboard)
- [ ] Build one medium project (e-commerce)
- [ ] System design: Folder structure, architecture decisions
- [ ] Mock interviews: Practice explaining concepts

---

### 16.2 Common Interview Scenarios

**Scenario 1: "Tell me about the last challenging problem you solved"**
- Problem statement (clear and specific)
- Your approach (step-by-step thinking)
- Technical decisions (why you chose X over Y)
- Result (metrics, learning)

**Example Answer:**
> "We had a dashboard with 5k users in a list that was lagging. I:
> 1. Profiled with DevTools → found 500ms change detection per interaction
> 2. Added OnPush strategy and trackBy → 50ms per interaction
> 3. Added virtual scrolling → only 20 DOM nodes rendered instead of 5k
> 4. Results: 10x faster, users happy, no more complaints
> Learned: Profile first, implement OnPush everywhere, use trackBy for *ngFor"

---

### 16.3 Questions to Ask Interviewer

1. "What does your current Angular codebase look like?" (Age, version, scale)
2. "What are the biggest performance/scalability challenges?" (Real problems)
3. "How do you structure your state management?" (NgRx, services, Signals)
4. "What testing strategy do you use?" (Unit, E2E, coverage)
5. "How do you handle large feature requests?" (Architecture, refactoring)

---

### 16.4 Red Flags vs Green Flags

**🚩 Red Flags:**
- "We're still on Angular 10" (not maintained)
- "We don't have tests" (nightmare to refactor)
- "We use 2-way binding everywhere" (hard to debug)
- "No lazy loading or code splitting" (slow apps)
- "Everyone does it their own way" (no standards)

**✅ Green Flags:**
- "Angular 17+, Signals-based" (modern tech)
- "Strong testing culture" (maintainable)
- "Strict TypeScript, linting" (quality)
- "Feature-based architecture" (organized)
- "Code reviews required" (quality gate)

---

### 16.5 Interview Day Checklist

**Before Interview:**
- [ ] Review your projects (be ready to go deep)
- [ ] Prepare 2-3 problem-solving stories
- [ ] Review company's tech stack
- [ ] Prepare 5+ questions for interviewer
- [ ] Sleep well, eat well
- [ ] Test your audio/video setup
- [ ] Have water nearby

**During Interview:**
- [ ] Think out loud (let them see your thought process)
- [ ] Ask for clarification if unsure
- [ ] Draw diagrams (state flow, architecture)
- [ ] Mention trade-offs (no "perfect" solution)
- [ ] Admit when you don't know (honesty counts)
- [ ] Ask good questions (shows you're interested)

**After Interview:**
- [ ] Send thank you email (within 24h)
- [ ] Mention specific topics you discussed
- [ ] Reiterate your interest
- [ ] Ask about next steps

---

---

## Final Wisdom

You're not "rookie" at 5+ years. You're likely:
- ✅ Solid at building features
- ✅ Familiar with most patterns
- ❌ But maybe not confident in deep knowledge
- ❌ Or haven't kept up with Angular evolution (16+)

**Your advantage:** You have real-world experience. Most juniors don't. Use that.

**Your challenge:** Showing you can think beyond code. Senior developers:
- Explain trade-offs (not just "what", but "why")
- Think about scalability from day 1
- Mentorship-ready (explain things clearly)
- Solve problems, not just features

**Final Tips:**
1. **Understand the "why"** - Not just syntax, but WHY Angular does it that way
2. **Performance mindset** - Always think: "How would this scale to 10x users?"
3. **Communication** - Explain code like you're teaching someone
4. **Stay current** - Angular moves fast. Know what's new (Signals, zoneless)
5. **Trade-offs** - Senior developers recognize that every choice has costs

---

**You've got this! 🚀**

Go build something ambitious. Interview prep is nice, but nothing beats real projects and shipping code.

---

*Last updated: January 2026*
*Angular version: 20+*
*Confidence level after this guide: 9/10* 🎯
