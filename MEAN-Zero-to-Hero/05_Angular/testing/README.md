# Angular Testing (Jasmine, TestBed, Best Practices)

> **Goal**: Write reliable, fast unit tests for Angular components and services.

---

## 1️⃣ Core Concepts

### TestBed
The main testing utility for Angular. It configures a testing module (similar to `@NgModule`) to create isolated component and service instances.

```typescript
beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [MyComponent], // For Standalone Components
    providers: [MyService]
  }).compileComponents();
});
```

### ComponentFixture
Wraps the component under test, providing access to:
*   `fixture.componentInstance`: The component class.
*   `fixture.nativeElement`: The rendered DOM.
*   `fixture.detectChanges()`: Triggers change detection.

---

## 2️⃣ Testing a Component

```typescript
describe('UserCardComponent', () => {
  let component: UserCardComponent;
  let fixture: ComponentFixture<UserCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UserCardComponent);
    component = fixture.componentInstance;
    component.user = { id: 1, name: 'Test User' }; // Set @Input
    fixture.detectChanges(); // Trigger initial rendering
  });

  it('should display user name', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h2')?.textContent).toContain('Test User');
  });

  it('should emit event on button click', () => {
    spyOn(component.selected, 'emit'); // Spy on @Output
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.selected.emit).toHaveBeenCalledWith(component.user);
  });
});
```

---

## 3️⃣ Testing a Service (with HTTP)

```typescript
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('DataService', () => {
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

    const req = httpMock.expectOne('/api/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers); // Simulate response
  });

  afterEach(() => httpMock.verify()); // Ensure no outstanding requests
});
```

---

## 4️⃣ `fakeAsync` and `tick`

Used to control time in tests (e.g., for `debounceTime`, `setTimeout`).

```typescript
it('should debounce search', fakeAsync(() => {
  component.search('hello');
  tick(300); // Simulate 300ms passing
  expect(mockSearchService.search).toHaveBeenCalledWith('hello');
}));
```

---

## 5️⃣ Mocking Dependencies

Use `jasmine.createSpyObj` to create mock objects.

```typescript
const mockRouter = jasmine.createSpyObj('Router', ['navigate']);
const mockAuthService = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
mockAuthService.isLoggedIn.and.returnValue(true); // Configure mock

TestBed.configureTestingModule({
  providers: [
    { provide: Router, useValue: mockRouter },
    { provide: AuthService, useValue: mockAuthService }
  ]
});
```

---

## 6️⃣ Best Practices

1.  **Keep Tests Fast:** Mock all external dependencies (HTTP, Router).
2.  **Test Behavior, Not Implementation:** Don't test private methods directly.
3.  **AAA Pattern:** Arrange → Act → Assert.
4.  **One Assertion Per Test (Ideally):** Makes failures easier to diagnose.
5.  **Use `async`/`await` or `fakeAsync`:** For all async operations.
