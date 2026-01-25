# The 'this' Keyword

## 📚 Table of Contents
- [Beginner: What is 'this'?](#beginner-what-is-this)
- [Intermediate: The 4 Binding Rules](#intermediate-the-4-binding-rules)
- [Advanced: Why 'this' Breaks & How to Fix It](#advanced-why-this-breaks--how-to-fix-it)

---

## Beginner: What is 'this'?

### Simple Definition
`this` is a keyword that refers to the **object that is executing the current function**.

### The Key Insight
> **`this` depends on HOW a function is CALLED, not where it is defined.**

```javascript
const person = {
  name: 'Rahul',
  greet: function() {
    console.log('Hello, I am ' + this.name);
  }
};

person.greet();  // "Hello, I am Rahul"

const greetFunc = person.greet;
greetFunc();     // "Hello, I am undefined" (in strict mode) or global name
```

Same function, different `this`!

---

## Intermediate: The 4 Binding Rules

JavaScript determines `this` using these rules (in order of precedence):

### Rule 1: Default Binding (Lowest Priority)

When function is called standalone:

```javascript
function showThis() {
  console.log(this);
}

showThis(); // window (browser) or global (Node) or undefined (strict mode)
```

```javascript
'use strict';
function showThis() {
  console.log(this);
}
showThis(); // undefined
```

### Rule 2: Implicit Binding

When function is called as a method of an object:

```javascript
const user = {
  name: 'Rahul',
  greet() {
    console.log(this.name);
  }
};

user.greet();  // "Rahul" — this = user
```

**WATCH OUT: Implicit binding is LOST when:**

```javascript
const user = {
  name: 'Rahul',
  greet() {
    console.log(this.name);
  }
};

// ❌ Extracting the method loses binding
const greet = user.greet;
greet();  // undefined (no object to the left of the dot)

// ❌ Passing as callback loses binding
setTimeout(user.greet, 1000);  // undefined

// ❌ Nested function loses binding
const user2 = {
  name: 'Rahul',
  greet() {
    function inner() {
      console.log(this.name);  // this is NOT user2!
    }
    inner();
  }
};
user2.greet();  // undefined
```

### Rule 3: Explicit Binding

Using `call()`, `apply()`, or `bind()`:

```javascript
function greet(greeting, punctuation) {
  console.log(greeting + ', ' + this.name + punctuation);
}

const user = { name: 'Rahul' };

// call: args passed individually
greet.call(user, 'Hello', '!');  // "Hello, Rahul!"

// apply: args passed as array
greet.apply(user, ['Hi', '?']);  // "Hi, Rahul?"

// bind: returns NEW function with bound this
const boundGreet = greet.bind(user);
boundGreet('Hey', '.');          // "Hey, Rahul."
```

**Key difference:**
- `call` and `apply` → Invoke immediately
- `bind` → Returns new function (invoke later)

### Rule 4: new Binding (Highest Priority)

When function is called with `new`:

```javascript
function Person(name) {
  // this = newly created object
  this.name = name;
}

const person = new Person('Rahul');
console.log(person.name); // "Rahul"
```

**What `new` does:**
1. Creates a new empty object `{}`
2. Links it to the function's prototype
3. Sets `this` = that new object
4. Returns the object (unless function returns an object)

### Priority Order

```
new binding       →  Highest
explicit binding  
implicit binding  
default binding   →  Lowest
```

```javascript
function foo() {
  console.log(this.a);
}

const obj1 = { a: 1, foo };
const obj2 = { a: 2 };

// Explicit beats implicit
obj1.foo.call(obj2);  // 2

// new beats explicit
const boundFoo = foo.bind(obj1);
const instance = new boundFoo();  // new wins, this.a is undefined
```

---

## Advanced: Why 'this' Breaks & How to Fix It

### Common Breakage: Callbacks

```javascript
class Component {
  constructor() {
    this.value = 42;
  }
  
  handleClick() {
    console.log(this.value);
  }
  
  setup() {
    // ❌ BROKEN: 'this' will not be the component
    button.addEventListener('click', this.handleClick);
  }
}
```

### Fix 1: Arrow Functions (Lexical 'this')

Arrow functions **don't have their own 'this'**. They inherit from enclosing scope.

```javascript
class Component {
  constructor() {
    this.value = 42;
  }
  
  handleClick = () => {  // Arrow function
    console.log(this.value);  // 'this' is the component
  }
  
  setup() {
    button.addEventListener('click', this.handleClick);  // ✅ Works
  }
}
```

### Fix 2: Bind in Constructor

```javascript
class Component {
  constructor() {
    this.value = 42;
    this.handleClick = this.handleClick.bind(this);  // Bind once
  }
  
  handleClick() {
    console.log(this.value);
  }
  
  setup() {
    button.addEventListener('click', this.handleClick);  // ✅ Works
  }
}
```

### Fix 3: Inline Arrow Function

```javascript
setup() {
  button.addEventListener('click', () => this.handleClick());  // ✅
  // Arrow function captures 'this' from setup(), which is the component
}
```

### Arrow Functions: Rules

```javascript
const obj = {
  value: 42,
  
  // ❌ Arrow function as method: BAD
  getValue: () => this.value,  // 'this' is NOT obj!
  
  // ✅ Regular function as method: GOOD
  getValue2() {
    return this.value;
  },
  
  // ✅ Arrow in nested function: GOOD
  delayed() {
    setTimeout(() => {
      console.log(this.value);  // 'this' is obj
    }, 1000);
  }
};
```

### Mental Model for Arrow Functions

> Arrow functions look at **where they are defined**, not how they are called.

```javascript
const outer = {
  value: 'outer',
  
  regularFunc: function() {
    // 'this' depends on how regularFunc is CALLED
    console.log(this.value);
  },
  
  arrowFunc: () => {
    // 'this' is from where arrowFunc is DEFINED (global scope here)
    console.log(this.value);  // undefined
  }
};

outer.regularFunc(); // 'outer'
outer.arrowFunc();   // undefined (not 'outer'!)
```

---

## 🎯 Interview Questions

### Fresher Level
1. What is the `this` keyword?
2. What's the difference between `call`, `apply`, and `bind`?
3. What value does `this` have in a regular function?

### Mid Level
1. Explain the 4 binding rules for `this`.
2. Why does `this` lose its binding when you extract a method?
3. How do arrow functions handle `this`?

### Senior Level
1. Explain the precedence of `this` binding rules.
2. How would you debug unexpected `this` behavior in a large codebase?
3. What are the performance implications of using `bind` vs arrow functions?

---

## 🧪 Interview Problem

**What's the output?**

```javascript
const obj = {
  name: 'obj',
  
  regularFunc: function() {
    console.log('Regular:', this.name);
    
    const arrowFunc = () => {
      console.log('Arrow:', this.name);
    };
    arrowFunc();
    
    function innerFunc() {
      console.log('Inner:', this.name);
    }
    innerFunc();
  }
};

obj.regularFunc();
```

<details>
<summary>Answer</summary>

```
Regular: obj
Arrow: obj
Inner: undefined (or window.name in non-strict)
```

**Explanation:**
1. `regularFunc` called with implicit binding → `this = obj`
2. `arrowFunc` inherits `this` from `regularFunc` → `this = obj`
3. `innerFunc` is called standalone (default binding) → `this = window/undefined`

</details>

---

**Next**: [Async JavaScript](../04_async-javascript/)
