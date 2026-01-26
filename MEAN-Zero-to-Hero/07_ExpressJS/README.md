# 07 Express.js: The Flexible Server

> **Goal**: Master Middleware, Routing, and REST API Best Practices.

---

## 1️⃣ Concept Explanation

### What is Express?
A minimal and flexible Node.js web application framework. It provides a thin layer of fundamental web application features, without obscuring Node.js features.

### The Middleware Pattern
Everything in Express is a middleware function.
`Request -> Middleware 1 -> Middleware 2 -> Response`

---

## 2️⃣ Code Examples

### ❌ Bad Example (Monolithic Route)
```javascript
app.get('/api/users', (req, res) => {
    // Auth logic
    // Validation logic
    // Database logic
    // Formatting logic
    res.send(data);
});
```

### ✅ Good Example (Layered)
```javascript
// routes.js
router.get('/', authMiddleware, userController.getAll);

// user.controller.js
exports.getAll = async (req, res, next) => {
    try {
        const users = await userService.findAll();
        res.json(users);
    } catch (err) {
        next(err); // Pass to Global Error Handler
    }
};
```

---

## 3️⃣ Internal Working: The 'Next' Function

Middleware functions have access to `req`, `res`, and `next`.
- If you don't call `next()`, the request hangs.
- If you call `next(err)`, it skips to the Error Handling Middleware.
- Express executes middleware strictly in the order they are defined (`app.use`).

---

## 4️⃣ Common Mistakes

### 🚨 Beginner Mistakes
- **Forgetting return**: `res.send('Done'); next();` -> Error "Cannot set headers after they are sent". Always use `return res.send(...)` if it's the end.
- **Parsing Body**: Forgetting `app.use(express.json())` makes `req.body` undefined.

### ⚠️ Production Mistakes
- **No Global Error Handler**: Crashing the server on 500 errors instead of sending a formatted JSON response.
- **Blocking Middleware**: Doing CPU intensive work in a middleware blocking all other requests.

---

## 5️⃣ Optimization & Best Practices

### Security
- **Helmet**: `app.use(helmet())` sets secure HTTP headers.
- **Rate Limiting**: Prevent DDoS. `express-rate-limit`.
- **Cors**: Configure strictly. Don't use `*`.

### Structure
- Use `Routes` -> `Controllers` -> `Services` -> `Data Access` layers.

---

## 6️⃣ Interview QnA

### Beginner
**Q: `app.use` vs `app.get`?**
A: `app.use` applies to ALL HTTP methods (good for middleware). `app.get` only applies to GET requests.

### Intermediate
**Q: How do you handle async errors in Express 4?**
A: You must using `try/catch` and call `next(err)`. Express 5 (beta) handles rejected promises automatically.

### Scenario-Based
**Q: Design a middleware to log request duration.**
A:
```javascript
const logger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} took ${duration}ms`);
    });
    next();
};
```

---

## 7️⃣ Web References

- [Express API Ref](https://expressjs.com/en/4x/api.html)
- [Mozilla Express Guide](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs)
