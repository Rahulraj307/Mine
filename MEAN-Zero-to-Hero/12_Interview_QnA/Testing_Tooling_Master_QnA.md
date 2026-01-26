# 📘 MASTER INTERVIEW Q&A: Testing & Tooling (Zero to Hero)
> **Section 9: Testing (Jasmine, Jest) & Tooling (ESLint, SonarQube, Webpack – 2025)**
> From "What is a Unit Test?" to Code Quality Pipelines and Build Optimization.

---

## 🟢 Part 1: Angular Testing (Jasmine & TestBed)

### 1️⃣ What is Unit Testing? Why is it important?
**Answer:**
Testing individual units (functions, components, services) in isolation to ensure they work correctly.
*   **Catches Bugs Early:** Cheaper to fix than in production.
*   **Refactoring Safety Net:** Change code confidently.
*   **Living Documentation:** Tests describe expected behavior.

### 2️⃣ Jasmine vs Jest
**Answer:**
| Feature | Jasmine | Jest |
| :--- | :--- | :--- |
| **Default For** | Angular CLI | React (but works with Angular) |
| **Speed** | Good | **Faster** (parallel execution) |
| **Mocking** | Needs `spyOn` | Built-in powerful mocking |
| **Snapshots** | No | Yes (for UI components) |

### 3️⃣ `TestBed` – The Angular Testing Foundation
**Answer:**
`TestBed` configures a testing module that mimics an `@NgModule`. It's used to create components and services in an isolated environment.
```typescript
beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [MyComponent, HttpClientTestingModule], // Standalone or Module
    providers: [{ provide: MyService, useValue: mockService }] // Mock dependencies
  }).compileComponents();
});

it('should create the component', () => {
  const fixture = TestBed.createComponent(MyComponent);
  expect(fixture.componentInstance).toBeTruthy();
});
```

### 4️⃣ Testing a Service (with HTTP)
**Answer:**
```typescript
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

let service: DataService;
let httpMock: HttpTestingController;

beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [DataService]
  });
  service = TestBed.inject(DataService);
  httpMock = TestBed.inject(HttpTestingController);
});

it('should fetch users', () => {
  const mockUsers = [{ id: 1, name: 'Rahul' }];
  service.getUsers().subscribe(users => {
    expect(users).toEqual(mockUsers);
  });

  const req = httpMock.expectOne('/api/users'); // Expect a request to this URL
  expect(req.request.method).toBe('GET');
  req.flush(mockUsers); // Provide mock response
});

afterEach(() => httpMock.verify()); // Ensure no unmatched requests
```

### 5️⃣ `fakeAsync` and `tick`
**Answer:**
Used to test asynchronous code (timers, Observables) synchronously.
*   **`fakeAsync`**: Wraps the test function, enabling time control.
*   **`tick(ms)`**: Simulates the passage of time.
```typescript
it('should debounce input', fakeAsync(() => {
  component.onSearch('hello');
  tick(300); // Simulate 300ms debounce
  expect(mockService.search).toHaveBeenCalledWith('hello');
}));
```

### 6️⃣ Mocking with `jasmine.createSpyObj`
**Answer:**
```typescript
const mockRouter = jasmine.createSpyObj('Router', ['navigate']);

TestBed.configureTestingModule({
  providers: [{ provide: Router, useValue: mockRouter }]
});

// In test:
expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
```

---

## 🟡 Part 2: Code Quality (ESLint & SonarQube)

### 7️⃣ What is ESLint?
**Answer:**
A **static analysis tool** that finds and fixes problems in JavaScript/TypeScript code.
*   **Linting:** Identifies syntax errors, bad practices, stylistic issues.
*   **Auto-fix:** `eslint --fix` can automatically correct many issues.

### 8️⃣ Key ESLint Concepts
**Answer:**
*   **Rules:** Individual checks (e.g., `no-unused-vars`, `@typescript-eslint/explicit-function-return-type`).
*   **Plugins:** Extend ESLint with more rules (e.g., `@typescript-eslint/eslint-plugin`, `eslint-plugin-rxjs`).
*   **Config File:** `.eslintrc.json` or `eslint.config.js` (Flat Config - new standard).

```json
// .eslintrc.json example
{
  "root": true,
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

### 9️⃣ What is SonarQube?
**Answer:**
A platform for **continuous inspection of code quality**. It goes beyond linting.
*   **Bugs:** Logic errors that will cause runtime issues.
*   **Vulnerabilities:** Security weaknesses (e.g., SQL Injection patterns).
*   **Code Smells:** Maintainability issues (long functions, deep nesting).
*   **Coverage:** Integrates with test runners to show % of code tested.
*   **Cognitive Complexity:** A metric measuring how hard code is to understand.

### 🔟 SonarQube in CI/CD
**Answer:**
1.  **Run Tests with Coverage:** `ng test --code-coverage` generates `lcov.info`.
2.  **Run SonarQube Scanner:** Analyzes code and sends report to SonarQube server.
3.  **Quality Gate:** A pass/fail check. If coverage drops below 80% or new bugs are introduced, the pipeline fails.

---

## 🔵 Part 3: Build Tools (Webpack & ESBuild)

### 1️⃣1️⃣ What is Webpack?
**Answer:**
A **module bundler**. It takes your modules (JS, TS, CSS, images) and bundles them into static assets for the browser.

**Key Concepts:**
*   **Entry:** The starting point of the dependency graph (`main.ts`).
*   **Output:** The bundled file(s) (`dist/main.js`).
*   **Loaders:** Transform files (e.g., `ts-loader` for TypeScript, `sass-loader` for SCSS).
*   **Plugins:** Perform wider tasks (e.g., `HtmlWebpackPlugin` generates `index.html`).

### 1️⃣2️⃣ Tree Shaking
**Answer:**
A dead-code elimination technique. Webpack analyzes `import`/`export` statements and removes unused code from the final bundle.
*   **Requires ES Modules (`import`/`export`).**
*   **`sideEffects: false`:** In `package.json`, tells Webpack it's safe to remove unused imports from a module.

### 1️⃣3️⃣ Code Splitting
**Answer:**
Breaking the bundle into smaller chunks that load on demand.
*   **Route-Based Splitting:** Angular's `loadComponent` for lazy loading routes.
*   **Vendor Splitting:** Separate `node_modules` into a `vendor.js` chunk (caches well).

### 1️⃣4️⃣ Webpack vs ESBuild (Angular 17+)
**Answer:**
| Feature | Webpack | ESBuild |
| :--- | :--- | :--- |
| **Speed** | Slower (JS-based) | **Much Faster** (Go-based) |
| **Plugins** | Rich ecosystem | Growing |
| **Angular CLI** | Default before v17 | **Default from v17+** |

**Angular CLI now uses ESBuild** by default, resulting in significantly faster builds.

---

## 🔴 Part 4: Real-World Story (STAR)

### 1️⃣5️⃣ "Tell me about a time you improved code quality?"
**Situation:**
"Our project had 15% unit test coverage, no linting, and frequent bugs slipping into production. Onboarding was slow because code style varied wildly."

**Task:**
"Establish a code quality baseline and integrate it into CI/CD."

**Action:**
1.  **Testing Culture:** Led a 2-week initiative to write tests for critical services. Raised coverage from 15% to 60%.
2.  **ESLint Setup:** Configured strict rules, including `no-explicit-any` and `rxjs/no-nested-subscribe`. Initially caused 500+ errors, so we implemented a `--max-warnings` threshold that decreased weekly.
3.  **SonarQube Gate:** Integrated SonarQube into GitHub Actions. PRs were blocked if they introduced new bugs or if coverage on new code was below 80%.

**Result:**
*   Production bugs dropped by 40%.
*   PR review time decreased because linting caught issues before human review.
*   Onboarding time for new devs reduced from 2 weeks to 1 week due to consistent code style.

---

## 🔥 Part 5: Rapid Fire

*   **`ng test` vs `ng test --code-coverage`?**
    *   `--code-coverage` generates an `lcov.info` file showing how much code was executed by tests.
*   **What is a "Code Smell"?**
    *   Not a bug, but a symptom of a deeper problem (e.g., a function with 200 lines, God Class).
*   **Why avoid `any` in TypeScript?**
    *   Disables type checking. Use `unknown` if the type is truly not known, then narrow it.
