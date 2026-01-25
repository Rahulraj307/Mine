# MongoDB Indexing

## 📚 Table of Contents
- [Beginner: What Are Indexes?](#beginner-what-are-indexes)
- [Intermediate: Index Types](#intermediate-index-types)
- [Advanced: Query Optimization](#advanced-query-optimization)

---

## Beginner: What Are Indexes?

### Without Index

```javascript
// Finding a user by email
db.users.find({ email: "rahul@example.com" })

// Without index: COLLECTION SCAN
// MongoDB reads EVERY document (millions!)
// O(n) - linear time
```

### With Index

```javascript
// Create index
db.users.createIndex({ email: 1 })

// Same query now uses INDEX SCAN
// MongoDB looks up directly in B-tree
// O(log n) - logarithmic time
```

### How Indexes Work

```
Index on "email" (simplified):

┌─────────────────────────────────────────┐
│                 B-Tree                   │
│                                          │
│           [john@...]                     │
│          /         \                     │
│   [alice@...]    [rahul@...]             │
│                       \                  │
│                     [zoe@...]            │
│                                          │
│  Each node points to document location   │
└─────────────────────────────────────────┘
```

### Creating Indexes

```javascript
// Single field index
db.users.createIndex({ email: 1 })  // 1 = ascending

// Compound index (multiple fields)
db.orders.createIndex({ userId: 1, createdAt: -1 })  // -1 = descending

// Unique index
db.users.createIndex({ email: 1 }, { unique: true })

// List indexes
db.users.getIndexes()

// Drop index
db.users.dropIndex({ email: 1 })
```

---

## Intermediate: Index Types

### Single Field Index

```javascript
db.products.createIndex({ price: 1 })

// Supports:
db.products.find({ price: 50 })
db.products.find({ price: { $gt: 30, $lt: 100 } })
db.products.find().sort({ price: 1 })
db.products.find().sort({ price: -1 })  // Both directions work
```

### Compound Index

```javascript
db.orders.createIndex({ userId: 1, createdAt: -1 })

// Supports (ESR Rule: Equality, Sort, Range):
db.orders.find({ userId: "123" })                          // ✅ Prefix
db.orders.find({ userId: "123" }).sort({ createdAt: -1 })  // ✅ Full match
db.orders.find({ userId: "123", createdAt: { $gt: date }}) // ✅ Prefix + range

// Does NOT support:
db.orders.find({ createdAt: { $gt: date }})  // ❌ Missing prefix
```

### Multikey Index (Arrays)

```javascript
// Document with array
{ name: "Laptop", tags: ["electronics", "computing", "gadgets"] }

// Index on array field
db.products.createIndex({ tags: 1 })

// Supports:
db.products.find({ tags: "electronics" })  // ✅ Contains
db.products.find({ tags: { $in: ["gadgets", "tools"] } })  // ✅
```

### Text Index

```javascript
db.articles.createIndex({ title: "text", body: "text" })

// Text search
db.articles.find({ $text: { $search: "javascript tutorial" } })

// With score
db.articles.find(
  { $text: { $search: "angular react" } },
  { score: { $meta: "textScore" } }
).sort({ score: { $meta: "textScore" } })
```

### Partial Index

```javascript
// Index only documents matching a condition
db.orders.createIndex(
  { status: 1 },
  { partialFilterExpression: { status: "pending" } }
)

// Smaller index, faster updates
// Only useful for queries on pending orders
```

### TTL Index (Auto-delete)

```javascript
// Automatically delete documents after time
db.sessions.createIndex(
  { createdAt: 1 },
  { expireAfterSeconds: 3600 }  // Delete after 1 hour
)
```

---

## Advanced: Query Optimization

### The explain() Method

```javascript
db.users.find({ email: "test@example.com" }).explain("executionStats")

// Key metrics to check:
{
  executionStats: {
    executionTimeMillis: 2,        // Lower is better
    totalDocsExamined: 1,          // Should equal nReturned
    totalKeysExamined: 1,          // Index keys scanned
    nReturned: 1,                  // Documents returned
  },
  winningPlan: {
    stage: "FETCH",                // IXSCAN = good, COLLSCAN = bad
    inputStage: {
      stage: "IXSCAN",
      indexName: "email_1"
    }
  }
}
```

### ESR Rule (Compound Index Design)

```javascript
// ORDER: Equality → Sort → Range

// Query pattern:
db.orders.find({
  customerId: "123",           // Equality
  status: { $in: ["a", "b"] }, // Range
}).sort({ createdAt: -1 })     // Sort

// ✅ Best index:
db.orders.createIndex({ customerId: 1, createdAt: -1, status: 1 })
// Equality first, then Sort, then Range
```

### Covered Queries

```javascript
// Index: { email: 1, name: 1 }

// Covered query (all fields in index, no document fetch)
db.users.find(
  { email: "test@example.com" },
  { email: 1, name: 1, _id: 0 }  // Project only indexed fields
)

// executionStats.totalDocsExamined = 0 (no doc access!)
```

### Index Intersection

```javascript
// Two separate indexes
db.users.createIndex({ age: 1 })
db.users.createIndex({ city: 1 })

// MongoDB can combine them
db.users.find({ age: 25, city: "Mumbai" })

// But compound index is usually more efficient
db.users.createIndex({ age: 1, city: 1 })
```

### Common Anti-patterns

```javascript
// ❌ Too many indexes
// Each insert/update must update ALL indexes
// Recommendation: < 10 indexes per collection

// ❌ Regex with leading wildcard
db.products.find({ name: /.*phone/ })  // Cannot use index

// ✅ Prefix regex CAN use index
db.products.find({ name: /^iPhone/ })  // Uses index

// ❌ $ne and $nin rarely use indexes efficiently
db.orders.find({ status: { $ne: "cancelled" } })  // Scans most of index

// ❌ Index on low-cardinality fields
db.users.createIndex({ gender: 1 })  // Only 2-3 values, not selective
```

---

## 🎯 Interview Questions

### Fresher Level
1. What is an index in MongoDB?
2. How do you create an index?
3. What is a compound index?

### Mid Level
1. Explain the ESR rule for compound indexes.
2. What is a covered query?
3. How do you analyze query performance?

### Senior Level
1. How do you design indexes for a multi-tenant application?
2. Explain index intersection and when it's used.
3. What are the trade-offs of having too many indexes?

---

**Next**: [Aggregation](../aggregation/)
