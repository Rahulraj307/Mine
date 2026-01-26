# 08 MongoDB: The NoSQL Database

> **Goal**: Master Schema Design, Indexes, and Aggregation Pipelines.

---

## 1️⃣ Concept Explanation

### Document-Oriented
Data is stored as BSON (Binary JSON) documents. Flexible schema means you aren't forced to have columns, but **validation** is still key for data integrity.

### SQL vs NoSQL
| Feature | SQL (Postgres) | NoSQL (Mongo) |
|---------|----------------|---------------|
| Structure | Tables & Rows | Collections & Docs |
| Relations | Joins | Embedding or References |
| Scaling | Vertical (Bigger CPU) | Horizontal (Sharding) |

---

## 2️⃣ Code Examples

### ❌ Bad Example (Bad Embedding)
Embedding 10,000 comments inside a single Post document.
- **Issue**: Max doc size is 16MB. Performance kills.

### ✅ Good Example (Referencing)
```javascript
// Post Collection
{ _id: 1, title: "Hello", content: "..." }

// Comment Collection
{ _id: 101, postId: 1, text: "Nice!" }
```

### Aggregation Framework
Pipeline of processing stages.
```javascript
db.orders.aggregate([
    { $match: { status: "A" } },
    { $group: { _id: "$custId", total: { $sum: "$amount" } } }
]);
```

---

## 3️⃣ Internal Working: Indexing & B-Trees

Without an index, Mongo performs a **Collection Scan** (reads every doc). SLLLOOOOW.
- Indexes are B-Tree data structures.
- **Rule**: If your query includes a field, considering indexing it.

---

## 4️⃣ Common Mistakes

### 🚨 Beginner Mistakes
- **No Validation**: Storing strings where numbers should be. (Use Mongoose Schemas).
- **Scanning Everything**: Queries without indexes.

### ⚠️ Production Mistakes
- **Unbounded Arrays**: Pushing items into an array indefinitely (`$push`). Eventually hits 16MB limit.
- **N+1 Problem**: Loop querying DB for each user. Use `$lookup` (Aggregation) instead.

---

## 5️⃣ Optimization & Best Practices

### Schema Design
- **Embed** when data is "Contains" (One-to-Few).
- **Reference** when data is "Related" (One-to-Many/Infinite).

### Performance
- **Projections**: Only fetch fields you need. `find({}, { name: 1 })`.
- **Compound Indexes**: `createIndex({ status: 1, createdAt: -1 })` for sorting active items by date.

---

## 6️⃣ Interview QnA

### Beginner
**Q: What is `ObjectId`?**
A: A 12-byte unique identifier (Timestamp + Random + Counter). Sorted by creation time.

### Intermediate
**Q: Explain Sharding.**
A: Splitting data across multiple machines using a Shard Key. Allows horizontal scaling.

### Scenario-Based
**Q: You need to implement a "Like" feature. How do you store it?**
A: If likes are few (<100), embed array of userIDs in Post. If likes are millions, separate collection `Likes` { postId, userId }. But also consider a counter field in Post `likeCount` for fast reads.

---

## 7️⃣ Web References

- [MongoDB Schema Design](https://www.mongodb.com/basics/data-model-design)
- [Mongoose Docs](https://mongoosejs.com/)
