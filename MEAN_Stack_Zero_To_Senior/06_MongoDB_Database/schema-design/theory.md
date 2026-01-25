# MongoDB Schema Design

## 📚 Table of Contents
- [Beginner: NoSQL Thinking](#beginner-nosql-thinking)
- [Intermediate: Embedding vs Referencing](#intermediate-embedding-vs-referencing)
- [Advanced: Schema Patterns](#advanced-schema-patterns)

---

## Beginner: NoSQL Thinking

### SQL vs NoSQL Mindset

```
SQL (Relational)           NoSQL (Document)
─────────────────          ─────────────────
Tables                     Collections
Rows                       Documents
Columns                    Fields
JOINs                      Embedded documents
Normalize everything       Embed or reference
Schema first               Schema flexible
```

### Document Structure

```javascript
// MongoDB document
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "Rahul",
  email: "rahul@example.com",
  address: {                          // Embedded document
    street: "123 Main St",
    city: "Mumbai"
  },
  orders: [                           // Array of embedded documents
    { product: "Laptop", price: 999 },
    { product: "Mouse", price: 25 }
  ],
  tags: ["developer", "premium"]       // Array of values
}
```

### Key Principle: Data That's Read Together, Lives Together

```javascript
// ❌ SQL thinking: Normalize everything
// Users collection
{ _id: 1, name: "Rahul" }

// Addresses collection (separate)
{ _id: 1, userId: 1, city: "Mumbai" }

// ✅ NoSQL thinking: Embed related data
{
  _id: 1,
  name: "Rahul",
  address: { city: "Mumbai" }  // No JOIN needed!
}
```

---

## Intermediate: Embedding vs Referencing

### When to Embed

```javascript
// ✅ EMBED when:
// 1. One-to-few relationship
// 2. Data is always accessed together
// 3. Child data doesn't grow unboundedly

// Example: User profile with addresses (user has 1-3 addresses)
{
  _id: ObjectId("..."),
  name: "Rahul",
  addresses: [
    { type: "home", city: "Mumbai" },
    { type: "work", city: "Pune" }
  ]
}
```

### When to Reference

```javascript
// ✅ REFERENCE when:
// 1. One-to-many (many items)
// 2. Many-to-many relationships
// 3. Data accessed independently
// 4. Data grows unboundedly

// Example: Blog posts with comments (could be thousands)
// Posts collection
{
  _id: ObjectId("post123"),
  title: "My Blog Post",
  authorId: ObjectId("user456")  // Reference
}

// Comments collection (separate)
{
  _id: ObjectId("comment789"),
  postId: ObjectId("post123"),  // Reference
  text: "Great post!"
}
```

### Decision Matrix

| Scenario | Pattern | Why |
|----------|---------|-----|
| User's profile info | Embed | Always accessed together |
| User's 1000s of orders | Reference | Unbounded growth |
| Order with line items | Embed | Same lifecycle, bounded |
| Product categories | Reference | Shared across products |
| Blog tags | Array of strings | Few, simple values |
| E-commerce inventory | Hybrid | Reference product, embed variants |

### Hybrid Pattern

```javascript
// E-commerce product with summary + details
// Products collection (quick listing)
{
  _id: ObjectId("..."),
  name: "Laptop Pro",
  price: 999,
  thumbnail: "laptop.jpg",
  category: { _id: "cat123", name: "Electronics" }  // Embedded summary
}

// Product details collection (full data)
{
  _id: ObjectId("..."),
  productId: ObjectId("..."),
  specs: { ram: "16GB", storage: "512GB" },
  reviews: [...],  // Or reference if many
  images: [...]
}
```

---

## Advanced: Schema Patterns

### Bucket Pattern (Time-series data)

```javascript
// ❌ One document per data point (too many documents)
{ timestamp: ISODate("2024-01-01T00:00:00"), value: 42 }
{ timestamp: ISODate("2024-01-01T00:01:00"), value: 43 }
...

// ✅ Bucket pattern: Group by time period
{
  sensor_id: 123,
  date: ISODate("2024-01-01"),
  readings: [
    { minute: 0, value: 42 },
    { minute: 1, value: 43 },
    // ... up to 1440 readings per day
  ],
  summary: { min: 10, max: 100, avg: 55 }  // Pre-computed
}
```

### Computed Pattern (Avoid expensive queries)

```javascript
// ❌ Computing count on every read
const count = await Order.countDocuments({ userId: "..." }); // Slow for millions

// ✅ Pre-compute and store
{
  _id: ObjectId("user..."),
  name: "Rahul",
  orderCount: 47,        // Increment on new order
  totalSpent: 12500      // Update on new order
}
```

### Extended Reference Pattern

```javascript
// Store essential info from referenced document
{
  _id: ObjectId("order..."),
  items: [...],
  customer: {
    _id: ObjectId("user..."),  // Reference
    name: "Rahul",              // Copied essential fields
    email: "rahul@example.com"  // Avoid JOIN for common queries
  }
}

// Trade-off: Duplicated data needs sync
// Good when: Read-heavy, customer info rarely changes
```

### Schema Versioning Pattern

```javascript
// Handle evolving schemas
{
  _id: ObjectId("..."),
  schemaVersion: 2,
  name: "Rahul",
  // v2 added email field
  email: "rahul@example.com"
}

// In application code
function normalizeUser(doc) {
  if (doc.schemaVersion === 1) {
    return { ...doc, email: null };  // Default for v1
  }
  return doc;
}
```

### Polymorphic Pattern

```javascript
// Different types in same collection
{
  _id: ObjectId("..."),
  type: "book",
  title: "JavaScript Guide",
  author: "MDN",
  pages: 500
}

{
  _id: ObjectId("..."),
  type: "movie",
  title: "Inception",
  director: "Nolan",
  runtime: 148
}

// Query by type
db.products.find({ type: "book" })
```

---

## 🎯 Interview Questions

### Fresher Level
1. What is the difference between SQL and NoSQL?
2. What is a document in MongoDB?
3. When would you embed vs reference?

### Mid Level
1. Explain the bucket pattern.
2. How do you handle one-to-many relationships in MongoDB?
3. What are the trade-offs of embedded documents?

### Senior Level
1. How would you design a schema for a social media platform?
2. Explain the extended reference pattern.
3. How do you handle schema migrations in MongoDB?

---

## 🧪 Design Exercise

**Design a schema for an e-commerce platform with:**
- Products (millions)
- Users (millions)
- Orders (each user has many orders)
- Reviews (each product has many reviews)
- Categories (products belong to categories)

<details>
<summary>Sample Solution</summary>

```javascript
// Products (indexed for search)
{
  _id: ObjectId(),
  name: "Laptop",
  price: 999,
  category: { _id: "cat1", name: "Electronics" },  // Extended reference
  inventory: 50,
  rating: { avg: 4.5, count: 127 },  // Pre-computed
  thumbnails: ["img1.jpg"]
}

// Users
{
  _id: ObjectId(),
  email: "user@example.com",
  addresses: [...],  // Embedded (bounded)
  orderCount: 15,    // Pre-computed
  cart: [...]        // Embedded
}

// Orders (separate collection - unbounded)
{
  _id: ObjectId(),
  userId: ObjectId(),
  items: [
    { productId: ObjectId(), name: "Laptop", price: 999, qty: 1 }
  ],
  total: 999,
  status: "shipped"
}

// Reviews (separate - unbounded per product)
{
  _id: ObjectId(),
  productId: ObjectId(),
  userId: ObjectId(),
  rating: 5,
  text: "Great product!"
}
```

</details>

---

**Next**: [Indexing](../indexing/)
