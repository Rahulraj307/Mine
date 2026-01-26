# Express.js Middleware

## 📚 Table of Contents
- [Beginner: What is Middleware?](#beginner-what-is-middleware)
- [Intermediate: Building Custom Middleware](#intermediate-building-custom-middleware)
- [Advanced: Execution Order & Patterns](#advanced-execution-order--patterns)

---

## Beginner: What is Middleware?

### Definition
Middleware are functions that execute during the request-response cycle. They have access to request, response, and the next middleware.

```javascript
const express = require('express');
const app = express();

// Middleware function
function logger(req, res, next) {
  console.log(`${req.method} ${req.url}`);
  next();  // Pass to next middleware
}

app.use(logger);

app.get('/', (req, res) => {
  res.send('Hello World');
});
```

### The Request Lifecycle

```
Request
   ↓
┌─────────────────┐
│ Middleware 1    │ (logging)
│ next() ─────────┼──┐
└─────────────────┘  │
   ↓                 │
┌─────────────────┐  │
│ Middleware 2    │  │ (auth)
│ next() ─────────┼──┤
└─────────────────┘  │
   ↓                 │
┌─────────────────┐  │
│ Route Handler   │  │
│ res.send()      │  │
└─────────────────┘  │
   ↓                 │
Response             │
   ↑                 │
   └─────────────────┘
```

### Common Built-in Middleware

```javascript
// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));
```

---

## Intermediate: Building Custom Middleware

### Middleware Signature

```javascript
function middleware(req, res, next) {
  // Do something with req/res
  // Then either:
  next();           // Pass to next middleware
  // OR
  res.send(...);    // End the cycle
  // OR
  next(error);      // Pass to error handler
}
```

### Practical Examples

#### Logger
```javascript
function logger(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  
  next();
}
```

#### Authentication
```javascript
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Use on specific routes
app.get('/dashboard', authenticate, (req, res) => {
  res.json({ user: req.user });
});
```

#### Rate Limiting
```javascript
const rateLimits = new Map();

function rateLimit(options = { windowMs: 60000, max: 100 }) {
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - options.windowMs;
    
    const requestLog = rateLimits.get(ip) || [];
    const recentRequests = requestLog.filter(time => time > windowStart);
    
    if (recentRequests.length >= options.max) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    
    recentRequests.push(now);
    rateLimits.set(ip, recentRequests);
    next();
  };
}

app.use(rateLimit({ windowMs: 60000, max: 100 }));
```

### Error Handling Middleware

```javascript
// Error middleware has 4 parameters
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  
  if (err.isOperational) {
    // Expected errors
    return res.status(err.statusCode).json({
      error: err.message
    });
  }
  
  // Unexpected errors
  res.status(500).json({
    error: 'Something went wrong'
  });
}

// Must be LAST middleware
app.use(errorHandler);
```

---

## Advanced: Execution Order & Patterns

### Middleware Execution Order

```javascript
// Order matters!

app.use(express.json());     // 1. Parse body first
app.use(logger);             // 2. Log request
app.use(authenticate);       // 3. Check auth

app.get('/', handler);       // 4. Handle route

app.use(notFound);           // 5. 404 handler
app.use(errorHandler);       // 6. Error handler last
```

### Conditional Middleware

```javascript
// Skip middleware based on condition
function conditionalMiddleware(req, res, next) {
  if (req.path.startsWith('/public')) {
    return next();  // Skip for public routes
  }
  
  // Apply middleware logic
  authenticate(req, res, next);
}
```

### Composing Middleware

```javascript
// Combine multiple middleware
function compose(...middlewares) {
  return (req, res, next) => {
    let index = 0;
    
    function dispatch() {
      if (index >= middlewares.length) {
        return next();
      }
      const middleware = middlewares[index++];
      middleware(req, res, dispatch);
    }
    
    dispatch();
  };
}

const securityMiddleware = compose(
  helmet(),
  cors(),
  rateLimit()
);

app.use(securityMiddleware);
```

### Router-Level Middleware

```javascript
const router = express.Router();

// Apply to all routes in this router
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Mount router
app.use('/api/user', router);
```

---

## 🎯 Interview Questions

### Fresher Level
1. What is middleware in Express?
2. What does `next()` do?
3. How do you add middleware to an Express app?

### Mid Level
1. Explain the difference between `app.use()` and `app.get()`.
2. How do you create error-handling middleware?
3. How do you apply middleware to specific routes only?

### Senior Level
1. How would you implement rate limiting middleware?
2. Explain the middleware execution order in Express.
3. How do you handle both sync and async errors in middleware?

---

**Next**: [Error Handling](../error-handling/)
