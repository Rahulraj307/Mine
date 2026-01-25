# Prototypes & Inheritance

## 📚 Table of Contents
- [Beginner: What Are Prototypes?](#beginner-what-are-prototypes)
- [Intermediate: Prototype Chain](#intermediate-prototype-chain)
- [Advanced: Classes vs Prototypes](#advanced-classes-vs-prototypes)

---

## Beginner: What Are Prototypes?

### The Core Concept

Every JavaScript object has a hidden link to another object called its **prototype**. When you access a property that doesn't exist, JavaScript looks up the prototype chain.

```javascript
const person = {
  greet() {
    return 'Hello!';
  }
};

const rahul = Object.create(person);  // rahul's prototype is person
console.log(rahul.greet());  // "Hello!" (found on prototype)
```

### Why Prototypes Exist

Without prototypes, every object would need its own copy of methods:

```javascript
// ❌ Memory waste: 1000 copies of greet function
const users = [];
for (let i = 0; i < 1000; i++) {
  users.push({
    name: `User ${i}`,
    greet() { return `Hello, ${this.name}`; }
  });
}

// ✅ Efficient: All share one greet function
function User(name) {
  this.name = name;
}
User.prototype.greet = function() {
  return `Hello, ${this.name}`;
};

const users = [];
for (let i = 0; i < 1000; i++) {
  users.push(new User(`User ${i}`));
}
```

### Visualizing Prototypes

```javascript
const arr = [1, 2, 3];
```

```
arr
  │
  └── [[Prototype]] → Array.prototype
                         │ .push()
                         │ .pop()
                         │ .map()
                         │
                         └── [[Prototype]] → Object.prototype
                                               │ .toString()
                                               │ .hasOwnProperty()
                                               │
                                               └── [[Prototype]] → null
```

---

## Intermediate: Prototype Chain

### How Property Lookup Works

```javascript
const animal = {
  eats: true,
  walk() {
    return 'Animal walks';
  }
};

const rabbit = Object.create(animal);
rabbit.jumps = true;

console.log(rabbit.jumps);  // true (own property)
console.log(rabbit.eats);   // true (from animal prototype)
console.log(rabbit.walk()); // "Animal walks" (from prototype)
console.log(rabbit.fly);    // undefined (not found anywhere)
```

**Lookup path:** `rabbit → animal → Object.prototype → null`

### Constructor Functions & Prototype

```javascript
// Constructor function
function Dog(name) {
  this.name = name;
}

// Adding to prototype (shared by all instances)
Dog.prototype.bark = function() {
  return `${this.name} says woof!`;
};

const dog1 = new Dog('Rex');
const dog2 = new Dog('Buddy');

console.log(dog1.bark());  // "Rex says woof!"
console.log(dog2.bark());  // "Buddy says woof!"

// Both use the SAME function
console.log(dog1.bark === dog2.bark);  // true
```

### The `new` Keyword Explained

When you call `new Dog('Rex')`:

```javascript
// What happens behind the scenes:
function Dog(name) {
  // 1. Create new empty object
  // this = {};
  
  // 2. Set its prototype
  // Object.setPrototypeOf(this, Dog.prototype);
  
  // 3. Run constructor
  this.name = name;
  
  // 4. Return the object
  // return this;
}
```

### Checking Prototypes

```javascript
const dog = new Dog('Rex');

// Check prototype
Object.getPrototypeOf(dog) === Dog.prototype; // true
dog.__proto__ === Dog.prototype;               // true (deprecated)

// Check instance
dog instanceof Dog;    // true
dog instanceof Object; // true

// Check own vs inherited property
dog.hasOwnProperty('name'); // true (own)
dog.hasOwnProperty('bark'); // false (inherited)

// Check if property exists (including inherited)
'bark' in dog; // true
```

### Shadowing

```javascript
const parent = { value: 10 };
const child = Object.create(parent);

console.log(child.value); // 10 (from prototype)

child.value = 20;  // Creates OWN property

console.log(child.value);  // 20 (own property)
console.log(parent.value); // 10 (unchanged)

delete child.value;
console.log(child.value); // 10 (prototype visible again)
```

---

## Advanced: Classes vs Prototypes

### ES6 Classes: Syntactic Sugar

```javascript
// ES6 class
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    return `${this.name} makes a sound`;
  }
}

// Is EXACTLY equivalent to:
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  return `${this.name} makes a sound`;
};
```

### Class Inheritance

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    return `${this.name} makes a sound`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);  // Must call super first!
    this.breed = breed;
  }
  
  speak() {
    return `${this.name} barks`;
  }
  
  speakLikeAnimal() {
    return super.speak();  // Call parent method
  }
}

const rex = new Dog('Rex', 'German Shepherd');
console.log(rex.speak());          // "Rex barks"
console.log(rex.speakLikeAnimal()); // "Rex makes a sound"
```

### Prototype Chain with Classes

```javascript
class Dog extends Animal { }

// Creates this chain:
// rex → Dog.prototype → Animal.prototype → Object.prototype → null
```

### Static Methods

```javascript
class MathUtils {
  static add(a, b) {
    return a + b;
  }
}

// Called on class, not instance
MathUtils.add(2, 3);  // 5

// NOT on prototype, on the constructor itself
typeof MathUtils.prototype.add; // undefined
typeof MathUtils.add;           // function
```

### Private Fields (ES2022)

```javascript
class BankAccount {
  #balance = 0;  // Private field
  
  deposit(amount) {
    this.#balance += amount;
  }
  
  getBalance() {
    return this.#balance;
  }
}

const account = new BankAccount();
account.deposit(100);
console.log(account.getBalance()); // 100
console.log(account.#balance);     // SyntaxError: Private field
```

### Object.create() for Inheritance

```javascript
// Classical inheritance without classes
const animal = {
  init(name) {
    this.name = name;
    return this;
  },
  speak() {
    return `${this.name} makes a sound`;
  }
};

const dog = Object.create(animal);
dog.speak = function() {
  return `${this.name} barks`;
};

const rex = Object.create(dog).init('Rex');
console.log(rex.speak()); // "Rex barks"
```

### Composition Over Inheritance

```javascript
// ❌ Deep inheritance hierarchies are fragile
class Animal { }
class Mammal extends Animal { }
class Dog extends Mammal { }
class GermanShepherd extends Dog { }

// ✅ Composition: Mix behaviors
const canWalk = {
  walk() { return `${this.name} walks`; }
};

const canSwim = {
  swim() { return `${this.name} swims`; }
};

const canBark = {
  bark() { return `${this.name} barks`; }
};

function createDog(name) {
  return Object.assign(
    { name },
    canWalk,
    canBark
  );
}

function createDuck(name) {
  return Object.assign(
    { name },
    canWalk,
    canSwim
  );
}
```

---

## 🎯 Interview Questions

### Fresher Level
1. What is a prototype in JavaScript?
2. What is the prototype chain?
3. How do you check if a property is own or inherited?

### Mid Level
1. Explain `Object.create()`.
2. What happens when you use the `new` keyword?
3. How are ES6 classes related to prototypes?

### Senior Level
1. Explain the diamond problem in JS inheritance. How do you handle it?
2. When would you choose composition over inheritance?
3. What are the performance implications of long prototype chains?

---

## 🧪 Interview Problem

**What's the output?**

```javascript
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  return this.name;
};

function Dog(name) {
  this.name = name;
}
Dog.prototype = Object.create(Animal.prototype);

const rex = new Dog('Rex');

console.log(rex.speak());
console.log(rex instanceof Dog);
console.log(rex instanceof Animal);
console.log(rex.constructor === Dog);
```

<details>
<summary>Answer</summary>

```
Rex
true
true
false  // ← Tricky!
```

**Why `false`?** When we set `Dog.prototype = Object.create(Animal.prototype)`, we lost the `constructor` property. Fix:

```javascript
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;  // Restore it
```

</details>

---

**Next**: [ES6+ Features](../06_es6-plus/)
