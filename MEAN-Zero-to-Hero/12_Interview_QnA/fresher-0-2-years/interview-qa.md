# Fresher Level Interview Questions (0-2 Years)

> Entry-level questions focused on fundamentals. Expect "What is X?" style questions.

---

## 📚 Table of Contents
- [JavaScript Fundamentals](#javascript-fundamentals)
- [Angular Basics](#angular-basics)
- [Node.js Essentials](#nodejs-essentials)
- [MongoDB Basics](#mongodb-basics)
- [Web Fundamentals](#web-fundamentals)

---

## JavaScript Fundamentals

### Q1: What are the different data types in JavaScript?

**Answer:**

**Primitive types (7):**
- `string` - Text data
- `number` - Numeric data (integers and floats)
- `boolean` - true/false
- `undefined` - Declared but not assigned
- `null` - Intentional absence of value
- `symbol` - Unique identifier
- `bigint` - Large integers

**Reference type:**
- `object` - Arrays, functions, plain objects

```javascript
typeof "hello"     // "string"
typeof 42          // "number"
typeof true        // "boolean"
typeof undefined   // "undefined"
typeof null        // "object" (historical bug!)
typeof {}          // "object"
typeof []          // "object"
typeof function(){} // "function"
```

---

### Q2: What is the difference between `let`, `const`, and `var`?

**Answer:**

| Feature | var | let | const |
|---------|-----|-----|-------|
| Scope | Function | Block | Block |
| Hoisting | Yes (undefined) | Yes (TDZ) | Yes (TDZ) |
| Re-declaration | Allowed | Error | Error |
| Re-assignment | Allowed | Allowed | Error |

```javascript
// var: function-scoped
function example() {
  var x = 1;
  if (true) {
    var x = 2;  // Same variable
  }
  console.log(x);  // 2
}

// let: block-scoped
function example2() {
  let x = 1;
  if (true) {
    let x = 2;  // Different variable
  }
  console.log(x);  // 1
}

// const: can't reassign
const arr = [1, 2, 3];
arr.push(4);     // ✅ OK (mutating)
arr = [5, 6];    // ❌ Error (reassigning)
```

---

### Q3: What is a closure?

**Answer:**

A closure is a function that "remembers" variables from its outer scope even after the outer function returns.

```javascript
function createCounter() {
  let count = 0;  // Private variable
  
  return function() {
    count++;
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3

// count is private, can't access directly
```

**Use cases:**
- Data privacy
- Function factories
- Callbacks that remember state

---

### Q4: What is hoisting?

**Answer:**

Hoisting is JavaScript's behavior of moving declarations to the top of their scope during compilation.

```javascript
// What you write:
console.log(x);  // undefined (not error!)
var x = 5;

// How JS sees it:
var x;           // Declaration hoisted
console.log(x);  // undefined
x = 5;

// let/const are hoisted but not initialized (TDZ)
console.log(y);  // ReferenceError!
let y = 5;
```

---

### Q5: What is the difference between `==` and `===`?

**Answer:**

- `==` (loose equality): Compares values, converts types if needed
- `===` (strict equality): Compares values AND types, no conversion

```javascript
// == converts types
5 == "5"      // true (string converted to number)
0 == false    // true (false converted to 0)
null == undefined  // true (special case)

// === doesn't convert
5 === "5"     // false (different types)
0 === false   // false
null === undefined  // false

// Always use === unless you specifically need type coercion
```

---

## Angular Basics

### Q6: What is Angular?

**Answer:**

Angular is a TypeScript-based framework for building web applications. It provides:

- **Components:** Reusable UI pieces
- **Templates:** HTML with Angular syntax
- **Services:** Shared logic and data
- **Modules:** Organize application features
- **Routing:** Navigate between views
- **Forms:** Handle user input
- **HTTP Client:** API communication

**Key difference from AngularJS:**
- Complete rewrite (2016)
- TypeScript-first
- Component-based architecture
- Better performance

---

### Q7: What is a component in Angular?

**Answer:**

A component controls a piece of UI. It has:

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-hello',           // HTML tag name
  templateUrl: './hello.component.html',  // View
  styleUrls: ['./hello.component.css']    // Styles
})
export class HelloComponent {
  name = 'World';  // Data
  
  greet() {        // Logic
    return `Hello, ${this.name}!`;
  }
}
```

```html
<!-- hello.component.html -->
<h1>{{ greet() }}</h1>
<input [(ngModel)]="name">
```

---

### Q8: Explain data binding in Angular.

**Answer:**

```html
<!-- 1. Interpolation: Component → View -->
<p>{{ message }}</p>

<!-- 2. Property Binding: Component → View -->
<img [src]="imageUrl">
<button [disabled]="isLoading">Submit</button>

<!-- 3. Event Binding: View → Component -->
<button (click)="handleClick()">Click me</button>

<!-- 4. Two-Way Binding: Both directions -->
<input [(ngModel)]="username">
```

---

### Q9: What is a service in Angular?

**Answer:**

A service is a class that contains reusable logic and data shared across components.

```typescript
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'  // Available app-wide
})
export class UserService {
  private users: User[] = [];
  
  getUsers() {
    return this.users;
  }
  
  addUser(user: User) {
    this.users.push(user);
  }
}

// Using in component
export class UserListComponent {
  constructor(private userService: UserService) {}
  
  users = this.userService.getUsers();
}
```

---

## Node.js Essentials

### Q10: What is Node.js?

**Answer:**

Node.js is a JavaScript runtime built on Chrome's V8 engine.

**Key features:**
- Runs JavaScript outside browser
- Single-threaded with event loop
- Non-blocking I/O
- NPM ecosystem

**Use cases:**
- API servers
- Real-time applications
- Microservices
- Build tools (Webpack, etc.)

---

### Q11: What is NPM?

**Answer:**

NPM (Node Package Manager) manages JavaScript packages.

```bash
# Install package locally
npm install express

# Install globally
npm install -g typescript

# Install dev dependency
npm install --save-dev jest

# Run script from package.json
npm run build
```

**package.json** contains:
- Project metadata
- Dependencies
- Scripts

---

### Q12: What is callback hell and how to solve it?

**Answer:**

```javascript
// ❌ Callback hell (pyramid of doom)
getData(function(a) {
  getMoreData(a, function(b) {
    getEvenMoreData(b, function(c) {
      // Deeply nested, hard to read
    });
  });
});

// ✅ Solution 1: Promises
getData()
  .then(a => getMoreData(a))
  .then(b => getEvenMoreData(b))
  .then(c => { /* Use c */ });

// ✅ Solution 2: Async/Await
async function fetchAll() {
  const a = await getData();
  const b = await getMoreData(a);
  const c = await getEvenMoreData(b);
  return c;
}
```

---

## MongoDB Basics

### Q13: What is MongoDB?

**Answer:**

MongoDB is a NoSQL document database.

- **Documents:** JSON-like objects (BSON)
- **Collections:** Groups of documents
- **No fixed schema:** Flexible structure
- **Horizontal scaling:** Built for scale

```javascript
// Document example
{
  _id: ObjectId("..."),
  name: "Rahul",
  email: "rahul@example.com",
  orders: [
    { product: "Laptop", price: 999 }
  ]
}
```

---

### Q14: What is the difference between SQL and NoSQL?

**Answer:**

| SQL | NoSQL |
|-----|-------|
| Tables | Collections |
| Rows | Documents |
| Schema required | Schema flexible |
| JOINs | Embedded documents |
| ACID transactions | Eventual consistency* |
| Vertical scaling | Horizontal scaling |

*MongoDB now supports ACID transactions

---

## Web Fundamentals

### Q15: What is HTTP? Explain common status codes.

**Answer:**

HTTP (HyperText Transfer Protocol) is how browsers communicate with servers.

**Methods:**
- `GET` - Read data
- `POST` - Create data
- `PUT` - Update (replace)
- `PATCH` - Update (partial)
- `DELETE` - Remove data

**Status Codes:**
| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

### Q16: What is REST API?

**Answer:**

REST (Representational State Transfer) is an architecture for web services.

**Principles:**
1. **Stateless:** Each request is independent
2. **Resource-based:** URLs represent resources
3. **HTTP methods:** CRUD operations
4. **JSON responses:** Standard data format

```
GET    /users          → List users
GET    /users/123      → Get user 123
POST   /users          → Create user
PUT    /users/123      → Update user 123
DELETE /users/123      → Delete user 123
```

---

## 🎯 Tips for Fresher Interviews

1. **Be honest** — It's OK to say "I don't know, but I would..."
2. **Explain with examples** — Show code snippets when possible
3. **Ask for clarification** — If a question is unclear
4. **Show enthusiasm** — Interest in learning matters
5. **Practice coding** — Expect live coding exercises

---

**Next**: [Mid-Level (2-4 Years)](../mid-2-4-years/)
