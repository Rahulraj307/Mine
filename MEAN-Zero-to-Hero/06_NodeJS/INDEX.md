# Backend Development - Topic Index

> Node.js, Express, and MongoDB fundamentals

---

## Node.js (06_NodeJS)

| Topic | Description | Status |
|-------|-------------|--------|
| Event Loop | Single-threaded async architecture | ⬜ |
| Modules | CommonJS, ES Modules, require vs import | ⬜ |
| Streams | Readable, writable, transform streams | ⬜ |
| File System | fs module, paths, async operations | ⬜ |
| Error Handling | try/catch, process errors | ⬜ |

### Quick Reference
```javascript
// Event Loop Phases
// 1. Timers (setTimeout, setInterval)
// 2. Pending callbacks (I/O callbacks)
// 3. Idle, prepare (internal)
// 4. Poll (retrieve new I/O events)
// 5. Check (setImmediate)
// 6. Close callbacks

// Modules
const fs = require('fs');           // CommonJS
import fs from 'fs';                // ES Modules

// Async file read
const data = await fs.promises.readFile('file.txt', 'utf8');
```

---

## Express.js (07_ExpressJS)

| Topic | Description | Status |
|-------|-------------|--------|
| Middleware | Request/response pipeline | ⬜ |
| Routing | RESTful endpoints | ⬜ |
| Error Handling | Centralized error middleware | ⬜ |
| Authentication | JWT, sessions, passport | ⬜ |
| Security | Helmet, CORS, rate limiting | ⬜ |

### Quick Reference
```javascript
// Middleware chain
app.use(helmet());          // Security headers
app.use(cors());            // Cross-origin
app.use(express.json());    // Body parser
app.use('/api', routes);    // Mount routes
app.use(errorHandler);      // Error handler (LAST)

// Route pattern
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
});
```

---

## MongoDB (08_MongoDB)

| Topic | Description | Status |
|-------|-------------|--------|
| Documents | BSON, schema design | ⬜ |
| Queries | Find, filtering, projection | ⬜ |
| Aggregation | Pipeline, stages, operators | ⬜ |
| Indexes | Single, compound, text search | ⬜ |
| Mongoose | ODM, schemas, validation | ⬜ |

### Quick Reference
```javascript
// Mongoose Schema
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  password: { type: String, select: false }
});

// Queries
await User.find({ role: 'admin' });
await User.findById(id).populate('posts');

// Aggregation
await Order.aggregate([
  { $match: { status: 'completed' } },
  { $group: { _id: '$userId', total: { $sum: '$amount' } } }
]);
```

---

## Learning Path

1. ⬜ Node.js event loop and async
2. ⬜ Express middleware and routing
3. ⬜ MongoDB CRUD operations
4. ⬜ REST API design
5. ⬜ Authentication (JWT)
6. ⬜ Error handling patterns
7. ⬜ Security best practices

---

## Related Resources

- [TaskMaster Pro Backend](../08_Projects/mean-taskmaster-pro/backend/) - Complete API
- [Node.js Q&A](../12_Interview_QnA/Node_Master_QnA.md)
- [MongoDB Q&A](../12_Interview_QnA/MongoDB_Master_QnA.md)

---

[🧭 Navigate](../NAVIGATION.md) | [📊 Track Progress](../PROGRESS.md)
